import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, UserPlus, Search, X, Phone, MapPin, Mail, Trash2 } from "lucide-react";
import { clientsApi, authApi, Client } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PageHeader from '../../components/layout/PageHeader'
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

  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

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
      <PageHeader
        title="Gestión de Clientes"
        subtitle="Administra los usuarios y sus credenciales de acceso"
        action={
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2"
            variant={isFormOpen ? "outline" : "primary"}
          >
            {isFormOpen ? <ChevronUp size={18} /> : <UserPlus size={18} />}
            {isFormOpen ? "Cancelar" : "Nuevo Cliente"}
          </Button>
        }
      />

      {/* Formulario Collapsible - Mobile-First */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Registrar Nuevo Cliente
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ingresa los datos para crear un nuevo perfil.
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Mobile-First: 1 columna en móvil, 2 en desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Juan Pérez"
                  className="sm:col-span-2"
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

              {/* Botones con touch target adecuado */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={creating}
                  className="w-full sm:w-auto h-11"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating} className="w-full sm:w-auto h-11">
                  {creating ? "Guardando..." : "Crear Cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barra de búsqueda - Mobile-First */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          inputMode="search"
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
        />
        {searchQuery && (
          <Button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
            variant="ghost"
            size="icon"
            aria-label="Limpiar búsqueda"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Lista */}
      <Card className="h-full min-h-[50vh] sm:min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-base font-bold text-gray-900 dark:text-white">
            Clientes ({filteredClients.length}{searchQuery ? ` / ${clients.length}` : ''})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 sm:py-8">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 sm:py-8 px-4">
            <div className="bg-gray-100 dark:bg-slate-700/50 rounded-full h-20 w-20 sm:h-16 sm:w-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={36} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-base sm:text-sm">
              {searchQuery ? "Intenta con otros filtros" : "Comienza agregando tu primer cliente."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto h-11">
                Crear primer cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            {/* Mobile View (Cards) - Consistente con SubscriptionItem */}
            <div className="sm:hidden -mx-2 px-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredClients.map((c: any) => (
                <Link
                  key={c.uid || c.id}
                  to={`/admin/client/${c.id}`}
                  className="block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 mb-2 hover:shadow-xl hover:border-secondary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar - mismo estilo que SubscriptionItem */}
                    <div className="w-12 h-12 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center text-secondary font-bold text-lg border-2 border-secondary/30 shrink-0">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate text-base">
                        {c.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <Mail size={12} />
                        {c.email || "Sin email"}
                      </div>
                    </div>
                    
                    {/* Indicador de teléfono y flecha */}
                    <div className="flex items-center gap-2 shrink-0">
                      {c.phone && (
                        <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center" title={c.phone}>
                          <Phone size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <ChevronDown size={22} className="text-gray-400 -rotate-90" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop View (Table) - Diseño limpio y consistente */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden sm:table">
              <thead className="bg-gray-50/50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Contacto
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredClients.map((c: any) => (
                  <tr key={c.uid || c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary border-2 border-secondary/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {c.address || "Sin dirección"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {c.email}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        {c.phone || "Sin teléfono"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/client/${c.id}`}
                          className="h-9 px-3 flex items-center justify-center text-sm font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
                        >
                          Ver
                        </Link>
                        <Button
                          onClick={() => handleDelete(c.uid || c.id)}
                          variant="ghost"
                          className="h-9 px-3 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
