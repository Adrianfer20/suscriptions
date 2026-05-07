import { useEffect, useState } from "react";
import { clientsApi, subscriptionsApi, communicationsApi } from "../../../services/api";

export default function useAdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    subscriptions: 0,
    revenue: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [subsList, setSubsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, subsRes, commsRes] = await Promise.all([
          clientsApi.list(),
          subscriptionsApi.list(),
          communicationsApi.listConversations(),
        ]);

        const clients = Array.isArray(clientsRes.data)
          ? clientsRes.data
          : clientsRes.data?.data || [];
        setClientsList(clients);

        const subs = Array.isArray(subsRes.data)
          ? subsRes.data
          : subsRes.data?.data || [];
        setSubsList(subs);

        const revenue = subs.reduce((acc: number, sub: any) => {
          if (!sub.amount) return acc;
          const clean = String(sub.amount).replace(/[^0-9]/g, "");
          return acc + (parseInt(clean) || 0);
        }, 0);

        // @ts-ignore
        const commsList: any[] = Array.isArray(commsRes.data)
          ? commsRes.data
          : commsRes.data?.data || [];
        const unread = commsList.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

        setStats({
          clients: clients.length,
          subscriptions: subs.length,
          revenue,
          unread,
        });
      } catch (e) {
        console.error("Error loading dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading, clientsList, subsList };
}
