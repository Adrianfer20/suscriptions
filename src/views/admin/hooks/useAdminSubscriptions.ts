import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  subscriptionsApi,
  clientsApi,
  authApi,
  Subscription,
  Client,
} from "../../../services/api";

export type SubscriptionWithEmail = Subscription & { clientEmail?: string };

export type SubscriptionForm = {
  clientId: string;
  startDate?: string;
  cutDate?: string;
  amount?: string;
  status?: string;
  plan?: string;
  passwordSub?: string;
  kitNumber?: string;
  country?: string;
};

const PLAN_LABELS: Record<string, string> = {
  "Itinerante Ilimitado": "Itinerante Ilimitado",
  "Itinerante Limitado": "Itinerante Limitado",
  "starlink-basic": "Itinerante Ilimitado",
  "starlink-limited": "Itinerante Limitado",
};

export function useAdminSubscriptions() {
  const [items, setItems] = useState<SubscriptionWithEmail[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<SubscriptionForm>({ clientId: "", startDate: today, cutDate: today, amount: "", plan: "", passwordSub: "", kitNumber: "", country: "" });
  // copied feedback handled with react-hot-toast
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cutDateSort, setCutDateSort] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetch = async () => {
      try {
        const res = await subscriptionsApi.list();
        if (!mounted) return;
        const list = (Array.isArray(res.data) ? res.data : res.data?.data || []) as Subscription[];
        const enriched = await Promise.all(
          list.map(async (s) => {
            const clientId = s.clientId;
            if (!clientId) return s as SubscriptionWithEmail;
            try {
              const r = await authApi.getUser(clientId);
              // @ts-ignore
              const user = r.data?.data || r.data?.user || r.data;
              return { ...s, clientEmail: user?.email } as SubscriptionWithEmail;
            } catch (e) {
              return s as SubscriptionWithEmail;
            }
          }),
        );
        if (mounted) setItems(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchClients = async () => {
      try {
        const res = await clientsApi.list();
        if (!mounted) return;
        const list = (Array.isArray(res.data) ? res.data : res.data?.data || []) as Client[];
        setClients(list);
      } catch (e) {
        // ignore
      }
    };
    fetchClients();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((sub) => {
        const client = clients.find((c) => c.uid === sub.clientId || c.id === sub.clientId);
        const clientName = client?.name?.toLowerCase() || "";
        return clientName.includes(q);
      });
    }
    if (statusFilter) {
      result = result.filter((sub) => sub.status === statusFilter);
    }
    if (cutDateSort) {
      result.sort((a, b) => {
        const da = a.cutDate || "";
        const db = b.cutDate || "";
        if (!da && !db) return 0;
        if (!da) return cutDateSort === "asc" ? 1 : -1;
        if (!db) return cutDateSort === "asc" ? -1 : 1;
        if (da === db) return 0;
        return cutDateSort === "asc" ? da.localeCompare(db) : db.localeCompare(da);
      });
    } else {
      result.sort((a, b) => {
        const clientA = clients.find((c) => c.uid === a.clientId || c.id === a.clientId);
        const clientB = clients.find((c) => c.uid === b.clientId || c.id === b.clientId);
        const nameA = clientA?.name?.toLowerCase() || "";
        const nameB = clientB?.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
    }
    return result;
  }, [items, clients, searchQuery, statusFilter, cutDateSort]);

  function handleEdit(item: SubscriptionWithEmail) {
    setIsFormOpen(true);
    setEditingId(item.id ?? null);
    setForm({
      clientId: item.clientId || "",
      plan: item.plan,
      amount: item.amount,
      startDate: item.startDate,
      cutDate: item.cutDate,
      country: item.country || "",
      passwordSub: item.passwordSub || "",
      kitNumber: item.kitNumber || "",
    });
    setTimeout(() => {
      document.getElementById("subscription-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function handleCancelEdit() {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ clientId: "", startDate: today, cutDate: today, amount: "", plan: "", passwordSub: "", kitNumber: "", country: "" });
  }

  const formatDate = (d?: string) => {
    if (!d) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = new Date(d);
    // @ts-ignore
    if (isNaN(parsed)) return d;
    return parsed.toISOString().slice(0, 10);
  };

  const normalizeAmount = (a?: string) => {
    if (!a) return "";
    const trimmed = a.trim();
    if (/^\$/.test(trimmed)) return trimmed;
    return `$${trimmed}`;
  };

  async function handleCreate(e?: React.FormEvent) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setCreating(true);
    try {
      if (!form.clientId) throw new Error("Cliente es requerido");
      if (!form.plan) throw new Error("Plan es requerido");
      if (!form.startDate) throw new Error("Fecha de inicio es requerida");
      if (!form.cutDate) throw new Error("Fecha de corte es requerida");
      if (!form.amount) throw new Error("Monto es requerido");
      if (!editingId && !form.passwordSub) throw new Error("Contraseña del servicio es requerida");

      const commonPayload: any = {
        plan: form.plan || "",
        startDate: formatDate(form.startDate) ?? form.startDate ?? "",
        cutDate: formatDate(form.cutDate) ?? form.cutDate ?? "",
        amount: normalizeAmount(form.amount),
        country: form.country || "",
        kitNumber: form.kitNumber || "",
      };

      if (form.passwordSub) commonPayload.passwordSub = form.passwordSub;

      if (editingId) {
        await subscriptionsApi.update(editingId, commonPayload);
        setItems((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...commonPayload, id: editingId } : s)));
        handleCancelEdit();
      } else {
        const createPayload = { ...commonPayload, clientId: form.clientId };
        const res = await subscriptionsApi.create(createPayload as Subscription);
        let created = (res.data?.data || res.data) as SubscriptionWithEmail;
        if (created?.clientId) {
          try {
            const r = await authApi.getUser(created.clientId);
            // @ts-ignore
            const user = r.data?.data || r.data?.user || r.data;
            created = { ...created, clientEmail: user?.email ?? undefined };
          } catch (e) {
            // ignore
          }
        }
        setItems((s) => [created, ...s]);
        setForm({ clientId: "", startDate: today, cutDate: today, amount: "", plan: "", passwordSub: "", kitNumber: "", country: "" });
        setIsFormOpen(false);
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg = serverMsg || (err instanceof Error ? err.message : "Error procesando solicitud");
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta suscripción permanentemente?")) return;
    try {
      await subscriptionsApi.delete(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      toast.success("Suscripción eliminada");
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg = serverMsg || (err instanceof Error ? err.message : "Error eliminando suscripción");
      toast.error(msg);
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles");
    } catch (e) {
      toast.error("No se pudo copiar");
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus as Subscription["status"] } : s)));
  };

  const toggleCutDateSort = () => {
    setCutDateSort((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return {
    items,
    clients,
    loading,
    creating,
    isFormOpen,
    setIsFormOpen,
    editingId,
    form,
    setForm,
    // copiedValue removed; handled by react-hot-toast
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredItems,
    PLAN_LABELS,
    handleEdit,
    handleCancelEdit,
    handleCreate,
    handleDelete,
    handleCopy,
    handleStatusChange,
    cutDateSort,
    toggleCutDateSort,
  } as const;
}

export default useAdminSubscriptions;
