import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { clientsApi, authApi, Client } from "../../api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type ClientWithEmail = Client & { email?: string };

type ClientForm = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
};

export default function AdminClients() {
  const [clients, setClients] = useState<ClientWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchClients = async () => {
      try {
        const res = await clientsApi.list();
        if (!mounted) return;

        // Handle potential different response structures if backend is inconsistent
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Enrich clients with email from Auth API
        const enriched = await Promise.all(
          list.map(async (c: Client) => {
            if (!c.uid) return c;
            try {
              const userRes = await authApi.getUser(c.uid);
              // Access user data safely
              const user = userRes.data?.data || userRes.data;
              // @ts-ignore: Accessing user property if nested differently
              const email = user?.email || user?.user?.email;
              return { ...c, email };
            } catch (e) {
              return c;
            }
          }),
        );

        if (mounted) setClients(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClients();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      if (!form.email || !form.password)
        throw new Error(
          "Email y password son requeridos para crear el auth user",
        );

      // 1) create auth user first
      console.log("Creating auth user...");
      const authRes = await authApi.create({
        email: form.email,
        password: form.password,
        displayName: form.name,
        role: "client",
      });

      const authData = authRes.data?.data || authRes.data;
      // @ts-ignore: safe access
      const uid = authData?.uid || authData?.user?.uid;

      if (!uid) {
        console.error("No uid found in:", authData);
        throw new Error("No uid retornado al crear usuario de auth");
      }

      // 2) create client record using uid
      const clientPayload = {
        uid,
        name: form.name,
        phone: form.phone || "",
        address: form.address || "",
      };
      const res = await clientsApi.create(clientPayload);

      // The response might be wrapped in .data or not, depending on backend consistency
      // We cast to Client to ensure we have the correct type for the state
      const createdData = (res.data?.data || res.data) as Client;
      const newClient: ClientWithEmail = { ...createdData, email: form.email };

      setClients((s) => [newClient, ...s]);
      setForm({ name: "", email: "", phone: "", address: "", password: "" });
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      const msg =
        serverMsg ||
        (err instanceof Error ? err.message : "Error creando cliente");
      alert(`Error: ${msg}`);
    } finally {
      setCreating(false);
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) {
      alert('ID del cliente no disponible')
      return
    }
    if (!confirm('¿Eliminar este cliente? Esta acción es irreversible.')) return
    try {
      await clientsApi.delete(id)
      setClients(prev => prev.filter(c => (c.id !== id && c.uid !== id)))
    } catch (err: any) {
      console.error('Error deleting client:', err)
      if (err.response?.status === 404) {
        alert('Cliente no encontrado (404).')
      } else {
        alert('Error eliminando cliente: ' + (err.response?.data?.message || err.message || 'Desconocido'))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestión de Clientes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra los usuarios y sus credenciales de acceso
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2"
          variant={isFormOpen ? "outline" : "primary"}
        >
          {isFormOpen ? <ChevronUp size={18} /> : <UserPlus size={18} />}
          {isFormOpen ? "Cancelar" : "Nuevo Cliente"}
        </Button>
      </div>

      {/* Formulario Collapsible */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
          <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registrar Nuevo Cliente
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ingresa los datos para crear un nuevo perfil de cliente.
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Juan Pérez"
                  className="md:col-span-2"
                />

                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="juan@ejemplo.com"
                />

                <Input
                  label="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  placeholder="••••••••"
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+56 9 1234 5678"
                />

                <Input
                  label="Dirección"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Av. Siempre Viva 123"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating} className="min-w-30">
                  {creating ? "Guardando..." : "Crear Cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      <Card title={`Lista de Clientes (${clients.length})`} className="h-full">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center p-12">
            <div className="bg-gray-100 dark:bg-slate-700/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus
                size={32}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay clientes registrados
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comienza agregando tu primer cliente.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              Crear primer cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            {/* Mobile View (Cards) */}
            <div className="sm:hidden space-y-4 px-4 pb-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {clients.map((c: any) => (
                <div
                  key={c.uid || c.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 text-white border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {c.email || "Sin email"}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/admin/client/${c.id}`}
                      className="text-primary hover:bg-primary/5 dark:hover:bg-primary/20 p-2 rounded-full transition-colors"
                    >
                      <ChevronDown size={20} className="-rotate-90" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-50 dark:border-slate-700/50">
                    <div>
                      <span className="block text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold">
                        Teléfono
                      </span>
                      {c.phone || "-"}
                    </div>
                    <div>
                      <span className="block text-gray-400 dark:text-gray-500 text-[10px] uppercase font-semibold">
                        Dirección
                      </span>
                      <span className="truncate block">{c.address || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="destructive" onClick={() => handleDelete(c.uid || c.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden sm:table">
              <thead className="bg-gray-50/50 dark:bg-slate-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Contacto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {clients.map((c: any) => (
                  <tr
                    key={c.uid || c.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 text-primary border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {c.address || "Sin dirección"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300 flex items-center gap-2">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                          Email
                        </span>
                        {c.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        {c.phone ? (
                          <>
                            <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium">
                              Tel
                            </span>
                            {c.phone}
                          </>
                        ) : (
                          "Sin teléfono"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/client/${c.id}`}
                        className="inline-flex items-center justify-center text-primary dark:text-white hover:text-primary-700 dark:hover:text-primary font-medium text-sm bg-primary/10 dark:bg-primary/50 hover:bg-primary/20 dark:hover:bg-secondary px-4 py-2 rounded-lg transition-colors"
                      >
                        Ver detalles
                      </Link>
                      <button
                        onClick={() => handleDelete(c.uid || c.id)}
                        className="ml-2 inline-flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-3 py-2 rounded-lg text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* End of Desktop View */}
          </div>
        )}
      </Card>
    </div>
  );
}
