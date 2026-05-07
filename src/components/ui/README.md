# Button component — catálogo y guía rápida

Resumen del `Button` central (`src/components/ui/Button.tsx`) y lista preliminar de usos.

Variantes soportadas (actual):
- `primary` — botón principal (bg-primary en light, dark:bg-secondary en dark).
- `secondary` — fondo claro / dark:bg-slate-800.
- `ghost` — transparente, para acciones menos prominentes.
- `outline` — borde + transparente.
- `danger` / `destructive` — botones rojos.

Tamaños soportados:
- `sm`, `md`, `lg`, `icon`.

Props recomendadas a estandarizar (próximo paso):
- `variant`, `size`, `className`, `disabled`, `loading`, `iconOnly`, `as` (tag override), `aria-label`.

Archivos que usan `Button` (recuento: 90 apariciones) — revisar para un refactor gradual:
- src/pages/Login.tsx
- src/views/admin/AdminClientEdit.tsx
- src/views/admin/AdminCommunication.tsx
- src/views/admin/AdminClients.tsx
- src/views/admin/AdminDashboard.tsx
- src/views/admin/AdminSubscriptions.tsx
- src/views/admin/AdminAutomation.tsx
- src/views/admin/AdminProfile.tsx
- src/views/admin/AdminPayments.tsx
- src/views/admin/AdminUsers.tsx
- src/views/admin/components/SubscriptionCard.tsx
- src/views/admin/components/SubscriptionForm.tsx
- src/views/admin/components/SubscriptionList.tsx
- src/views/admin/components/SubscriptionItem.tsx
- src/views/admin/components/SubscriptionsToolbar.tsx
- src/views/client/ClientProfile.tsx
- src/views/client/ClientSubscription.tsx
- src/views/client/ClientPayments.tsx
- src/views/client/components/PlanCard.tsx
- src/views/client/components/QuickAccessGrid.tsx
- src/components/ConversationItem.tsx
- src/components/ThemeToggle.tsx
- src/components/layout/Header.tsx
- src/components/layout/Sidebar.tsx
- src/components/ui/MonthFilterSelect.tsx
- src/components/ui/MonthPicker.tsx

Notas y recomendaciones:
- Primer paso: definir API definitiva del `Button` (añadir `loading` y `as`).
- Segundo: implementar variantes faltantes/estados (focus, loading, disabled) dentro de `Button`.
- Tercero: reemplazar botones nativos y enlaces-estilo por `Button` gradualmente, archivo por archivo.
- Hacer commits pequeños y PR por grupo de archivos para facilitar revisión.

Siguiente acción que puedo ejecutar: generar patch para extender la API de `Button` con `loading` y `as`, y reemplazar ejemplos pequeños (p. ej.  `AdminCommunication.tsx` y `ConversationItem.tsx`) como prueba de concepto.
