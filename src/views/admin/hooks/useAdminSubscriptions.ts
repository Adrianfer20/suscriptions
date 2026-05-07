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


export function useAdminSubscriptions() {
  const [items, setItems] = useState<SubscriptionWithEmail[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<SubscriptionForm>({ clientId: "", startDate: today, cutDate: today, amount: "", plan: "", passwordSub: "", kitNumber: "", country: "" });
  const [plans, setPlans] = useState<string[]>([]);
  const PLAN_LABELS = useMemo(() => {
    const map: Record<string, string> = {};
    plans.forEach((p) => (map[p] = p));
    return map;
  }, [plans]);
  // copied feedback handled with react-hot-toast
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cutDateFilter, setCutDateFilter] = useState<string>("");
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
    const fetchPlans = async () => {
      try {
        const res = await subscriptionsApi.getPlans();
        if (!mounted) return;
        const list = (Array.isArray(res.data) ? res.data : res.data?.data || []) as string[];
        setPlans(list);
      } catch (e) {
        console.warn('No se pudieron obtener los planes desde la API:', e);
      }
    };
    fetchPlans();
    return () => { mounted = false };
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
    
    // Helper: parse various cutDate formats (YYYY-MM-DD, ISO string, Firestore timestamp)
    const parseDateValue = (v: any): Date | null => {
      if (!v) return null;
      // Firestore timestamp object
      if (typeof v === 'object' && v._seconds != null) {
        return new Date(v._seconds * 1000);
      }
      if (typeof v === 'string') {
        // YYYY-MM-DD straightforward
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v);
        // Try Date parse for ISO or other formats
        const parsed = new Date(v);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      return null;
    };

    // Función para calcular días hasta la fecha de corte (relative to local today)
    const getDaysUntilCutDate = (cutDate: any): number | null => {
      const cutDateObj = parseDateValue(cutDate);
      if (!cutDateObj) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      cutDateObj.setHours(0, 0, 0, 0);
      const diffTime = cutDateObj.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    // Search by cutDate, client name, or plan
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((sub) => {
        // Normalize cutDate to string
        const cutDateVal = (() => {
          const d = parseDateValue(sub.cutDate);
          if (d) return d.toISOString().slice(0, 10).toLowerCase();
          if (typeof sub.cutDate === 'string') return sub.cutDate.toLowerCase();
          return '';
        })();

        const cutDateMatch = cutDateVal.includes(q);
        // Search by client name or email
        const client = clients.find((c) => c.uid === sub.clientId || c.id === sub.clientId);
        const clientName = (client?.name || client?.email || sub.clientEmail || '').toLowerCase();
        const clientMatch = clientName.includes(q);
        // Search by plan
        const planMatch = (sub.plan || '').toLowerCase().includes(q);
        // Search by amount (normalize removing $)
        const amountMatch = (sub.amount || '').toLowerCase().replace(/\$/g, '').includes(q.replace(/\$/g, ''));
        // Also allow searching by subscription id
        const idMatch = (sub.id || '').toLowerCase().includes(q);
        return cutDateMatch || clientMatch || planMatch || amountMatch || idMatch;
      });
    }
    
    // Default sort by cutDate (ascending - nearest first)
    result.sort((a, b) => {
      const dateA = a.cutDate || '';
      const dateB = b.cutDate || '';
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.localeCompare(dateB);
    });
    
    if (statusFilter) {
      const sf = statusFilter.toLowerCase().trim();
      result = result.filter((sub) => {
        const s = (sub.status || '').toLowerCase().trim();
        return s === sf;
      });
    }
    
    // Filtrar por fecha de corte
    if (cutDateFilter) {
      result = result.filter((sub) => {
        const days = getDaysUntilCutDate(sub.cutDate);
        if (cutDateFilter === "overdue") return days !== null && days < 0;
        if (cutDateFilter === "soon") return days !== null && days >= 0 && days <= 7;
        if (cutDateFilter === "ok") return days === null || days > 7;
        return true;
      });
    }
    
    // If no manual sort is selected, sort by cutDate (oldest to newest)
    if (!cutDateSort) {
      result.sort((a, b) => {
        const da = parseDateValue(a.cutDate);
        const db = parseDateValue(b.cutDate);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
      });
    } else {
      // If user explicitly set sort direction, apply it
      result.sort((a, b) => {
        const da = parseDateValue(a.cutDate);
        const db = parseDateValue(b.cutDate);
        const ta = da ? da.getTime() : 0;
        const tb = db ? db.getTime() : 0;
        return cutDateSort === 'asc' ? ta - tb : tb - ta;
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

  const handleRenew = async (id: string) => {
    try {
      const res = await subscriptionsApi.renew(id);
      const updated = res.data?.data || res.data;
      if (updated) {
        setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
        toast.success("Suscripción renovada correctamente");
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg = serverMsg || (err instanceof Error ? err.message : "Error renovando suscripción");
      toast.error(msg);
    }
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
    cutDateFilter,
    setCutDateFilter,
    filteredItems,
    PLAN_LABELS,
    handleEdit,
    handleCancelEdit,
    handleCreate,
    handleDelete,
    handleCopy,
    handleStatusChange,
    handleRenew,
    cutDateSort,
    toggleCutDateSort,
    plans,
  } as const;
}

export default useAdminSubscriptions;
