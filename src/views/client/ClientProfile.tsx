// ...existing code...
import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { User, Mail, Phone, MapPin, Calendar, Save, Lock, Bell, Shield, Loader2, AlertCircle, CheckCircle, Edit } from 'lucide-react'
import api, { Client } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ClientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [editOpen, setEditOpen] = useState<boolean>(false);

  // Efectos y handlers
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      if (!user?.id) {
        if (mounted) {
          setError('No se encontró el usuario');
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const id = user.id;
        const clientRes = await api.get(`/clients/${id}`);
        const clientData = clientRes.data?.data || clientRes.data;
        if (!mounted) return;
        setProfile(clientData);
        setFormData(clientData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (mounted) {
          setError('No se pudo cargar el perfil del cliente');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!profile?.id) throw new Error('No hay cliente cargado');
      const payload: any = {};
      if (typeof formData.phone === 'string' && formData.phone.trim() !== '') payload.phone = formData.phone;
      if (typeof formData.address === 'string' && formData.address.trim() !== '') payload.address = formData.address;
      if (Object.keys(payload).length === 0) throw new Error('No hay datos para actualizar');
      await api.patch(`/clients/${profile.id}`, payload);
      setProfile(prev => ({ ...prev, ...payload } as Client));
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Render principal
  return (
    <React.Fragment>
      <div className="space-y-6">
        {/* Cintillo header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary tracking-tight">Mi Perfil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">Gestiona tu información personal</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Card de información de perfil */}
          <Card className="flex-1 p-6 shadow-md border border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-primary dark:text-secondary mb-4 flex items-center gap-2">
              <User className="w-6 h-6" /> Mi Perfil
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-200">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-200">{profile?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-200">{profile?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-200">{profile?.address || '-'}</span>
              </div>
            </div>
          </Card>
          {/* Card de edición */}
          <Card className="flex-1 p-6 shadow-md border border-gray-200 dark:border-slate-800">
            <h3 className="font-semibold text-primary dark:text-secondary mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" /> Editar información personal
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+52 123 456 7890"
                />
                <Input
                  label="Dirección"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Tu dirección completa"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={saving || !((formData.phone !== profile?.phone) || (formData.address !== profile?.address))}
                  className={(!((formData.phone !== profile?.phone) || (formData.address !== profile?.address))) 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'dark:text-secondary'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Actualizar información'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
// ...existing code...
