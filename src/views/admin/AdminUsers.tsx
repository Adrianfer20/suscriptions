// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { authApi, User } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Shield, Edit, Check, X, UserPlus, Trash, Save, User as UserIcon, Lock, Mail, MoreHorizontal } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [editForm, setEditForm] = useState<{ displayName: string, role: string, disabled: boolean }>({ 
      displayName: '', 
      role: 'staff', 
      disabled: false 
  }) 
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState({ email: '', password: '', displayName: '', role: 'staff' })
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await authApi.listUsers({ limit: 50 })
      // @ts-ignore
      if (res.data?.data?.users) {
        // @ts-ignore
        setUsers(res.data.data.users)
      } else if (Array.isArray(res.data)) {
         // @ts-ignore
         setUsers(res.data)
      } else if (res.data?.data && Array.isArray(res.data.data)) {
         setUsers(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: any) => {
    setEditingId(user.uid)
    setEditForm({ 
      displayName: user.displayName || user.name || '', 
      role: user.role || 'guest',
      disabled: user.disabled || false
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ displayName: '', role: 'staff', disabled: false })
  }

  const saveEdit = async (uid: string) => {
    try {
      await authApi.updateUser(uid, {
        displayName: editForm.displayName,
        role: editForm.role,
        disabled: editForm.disabled
      })
      
      setUsers(prev => prev.map(u => 
        u.uid === uid ? { ...u, ...editForm } as User : u
      ))
      
      setEditingId(null)
    } catch (err: any) {
      alert('Error actualizando usuario: ' + (err.message || 'Error desconocido'))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
        await authApi.create({
            email: newForm.email,
            password: newForm.password,
            displayName: newForm.displayName,
            // @ts-ignore
            role: newForm.role
        })
        setNewForm({ email: '', password: '', displayName: '', role: 'staff' })
        setIsFormOpen(false)
        fetchUsers()
    } catch (err: any) {
        alert('Error creando usuario: ' + (err.message || 'Error desconocido'))
    } finally {
        setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await authApi.deleteUser(userToDelete.uid)
      setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid))
      setUserToDelete(null)
    } catch (err: any) {
      alert('Error eliminando usuario: ' + (err.message || 'Error desconocido'))
      setUserToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Shield size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Usuarios</h2>
             <p className="text-sm text-slate-500 dark:text-slate-400">Administra el staff y accesos administrativos</p>
           </div>
        </div>
        <Button 
            onClick={() => {
                if(isFormOpen) {
                    setIsFormOpen(false)
                } else {
                    setIsFormOpen(true)
                }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            variant={isFormOpen ? "outline" : "primary"}
        >
            {isFormOpen ? <X size={18} /> : <UserPlus size={18} />}
            {isFormOpen ? 'Cancelar' : 'Nuevo Usuario'}
        </Button>
      </div>

       {/* Formulario Collapsible */}
       {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out mb-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Registrar Nuevo Usuario</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Crea una cuenta para un administrador o miembro del staff.</p>
            </div>
          </div>
          <div className="p-6">
             <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Nombre Completo" 
                    value={newForm.displayName} 
                    onChange={(e) => setNewForm(prev => ({ ...prev, displayName: e.target.value }))} 
                    required 
                    placeholder="Ej. Admin User"
                    startContent={<UserIcon size={16} className="text-slate-400" />}
                  />
                  
                  <Input 
                    label="Email" 
                    type="email"
                    value={newForm.email} 
                    onChange={(e) => setNewForm(prev => ({ ...prev, email: e.target.value }))} 
                    required 
                    placeholder="admin@empresa.com"
                    startContent={<Mail size={16} className="text-slate-400" />}
                  />

                  <Input 
                    label="Contraseña" 
                    type="password"
                    value={newForm.password} 
                    onChange={(e) => setNewForm(prev => ({ ...prev, password: e.target.value }))} 
                    required 
                    placeholder="••••••••"
                    startContent={<Lock size={16} className="text-slate-400" />}
                  />

                  <div>
                     <label className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300 block">Rol</label>
                     <div className="relative">
                       <select 
                          className="flex h-11 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow pl-10 appearance-none"
                          value={newForm.role}
                          onChange={(e) => setNewForm(prev => ({ ...prev, role: e.target.value }))}
                       >
                          <option value="staff">Staff (Personal)</option>
                          <option value="admin">Administrador (Acceso Total)</option>
                          <option value="client">Cliente</option>
                       </select>
                       <Shield size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={creating}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="min-w-32">
                    {creating ? 'Guardando...' : 'Crear Usuario'}
                  </Button>
                </div>
             </form>
          </div>
        </div>
      )}

      <Card title={`Usuarios del Sistema (${users.length})`}>
        {loading ? (
             <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
        ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                {/* Mobile View (Cards) */}
                <div className="sm:hidden space-y-4 px-4 pb-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {users.map((u: any) => (
                      <div key={u.uid} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-primary dark:text-white flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-slate-600 shadow-sm shrink-0 uppercase">
                                      {(u.displayName || u.name || u.email || '?').charAt(0)}
                                  </div>
                                  <div>
                                      {editingId === u.uid ? (
                                        <Input 
                                            value={editForm.displayName} 
                                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                            className="h-8 text-xs mb-1"
                                            placeholder="Nombre"
                                        />
                                      ) : (
                                        <div className="text-sm font-semibold text-slate-400 dark:text-white">{u.displayName || u.name || 'Sin nombre'}</div>
                                      )}
                                      <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                                  </div>
                              </div>
                              {editingId !== u.uid && (
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEdit(u)} 
                                        className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setUserToDelete(u)} 
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                              )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                              <div>
                                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold mb-1">Rol</span>
                                    {editingId === u.uid ? (
                                        <select 
                                            className="block w-full py-1 text-xs border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-xs rounded-md"
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                            <option value="client">Cliente</option>
                                            <option value="guest">Guest</option>
                                        </select>
                                     ) : (
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full border 
                                            ${u.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' : 
                                              u.role === 'staff' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 
                                              u.role === 'client' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                                            {u.role || 'guest'}
                                        </span>
                                     )}
                              </div>
                              <div>
                                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold mb-1">Estado</span>
                                    {editingId === u.uid ? (
                                         <div className="flex items-center gap-2">
                                            <input 
                                                id={`disabled-mobile-${u.uid}`}
                                                type="checkbox" 
                                                checked={editForm.disabled} 
                                                onChange={(e) => setEditForm({...editForm, disabled: e.target.checked})}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                                            />
                                            <label htmlFor={`disabled-mobile-${u.uid}`} className="text-xs text-slate-700 dark:text-slate-300">Bloqueado</label>
                                        </div>
                                    ) : (
                                        // @ts-ignore
                                        u.disabled ? 
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                                            Bloqueado
                                        </span> : 
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                            Activo
                                        </span>
                                    )}
                              </div>
                          </div>
                          
                          {editingId === u.uid && (
                             <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 dark:border-slate-700">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={cancelEdit}
                                    className="text-xs h-8"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    size="sm" 
                                    onClick={() => saveEdit(u.uid)}
                                    className="text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Guardar Cambios
                                </Button>
                             </div>
                          )}
                      </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 hidden sm:table">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {users.map((u: any) => (
                            <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === u.uid ? (
                                        <div className="space-y-1">
                                            <Input 
                                                value={editForm.displayName} 
                                                onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                                className="h-8 text-xs"
                                                placeholder="Nombre"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-700 shadow-sm uppercase shrink-0">
                                                {u.email?.charAt(0) || '?'}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">{u.displayName || u.name || 'Sin nombre'}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     {editingId === u.uid ? (
                                        <select 
                                            className="block w-full py-1 text-xs border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary sm:text-xs rounded-md"
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                            <option value="client">Cliente</option>
                                            <option value="guest">Guest</option>
                                        </select>
                                     ) : (
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full border 
                                            ${u.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' : 
                                              u.role === 'staff' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 
                                              u.role === 'client' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                                            {u.role || 'guest'}
                                        </span>
                                     )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === u.uid ? (
                                         <div className="flex items-center gap-2">
                                            <input 
                                                id={`disabled-${u.uid}`}
                                                type="checkbox" 
                                                checked={editForm.disabled} 
                                                onChange={(e) => setEditForm({...editForm, disabled: e.target.checked})}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                                            />
                                            <label htmlFor={`disabled-${u.uid}`} className="text-xs text-slate-700 dark:text-slate-300">Deshabilitado</label>
                                        </div>
                                    ) : (
                                        // @ts-ignore
                                        u.disabled ? 
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                                            Bloqueado
                                        </span> : 
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                            Activo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === u.uid ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => saveEdit(u.uid)} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors" title="Guardar">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors" title="Cancelar">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(u)} 
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                                            >
                                                <Edit size={14} /> Editar
                                            </button>
                                            <button 
                                                onClick={() => setUserToDelete(u)} 
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl dark:shadow-black/50 border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                        <Trash size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">¿Eliminar Usuario?</h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                    Estás a punto de eliminar a <strong>{userToDelete.displayName || userToDelete.email}</strong>. 
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg flex items-start gap-2 mb-6">
                    <Shield size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                        Esta acción es <strong>irreversible</strong> y ejecutará una limpieza en cascada (cuenta, perfil y suscripciones asociadas).
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setUserToDelete(null)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 dark:border-red-600"
                    >
                        Confirmar Eliminación
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
