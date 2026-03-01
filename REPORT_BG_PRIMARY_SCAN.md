Reporte de uso `bg-primary` — Scan automático

Fecha: 28/02/2026

Resumen
- Encontradas 31 ocurrencias de `bg-primary` (o variantes como `bg-primary/10`, `dark:bg-primary`, etc.) en `src/`.
- Recomendación general: sustituir usos directos en controles interactivos por el componente `Button` (usar `variant` adecuado). Mantener algunos usos decorativos (avatares, badges) pero uniformizar la semántica y verificar contraste en modo oscuro.

Lista de resultados (archivo — línea — fragmento relevante)

- src/views/admin/AdminUsers.tsx — L145
  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
  Recomendación: avatar decorativo está bien con `bg-primary/10`, mantener pero revisar contraste dark.

- src/views/admin/AdminUsers.tsx — L366
  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary ...">
  Recomendación: idem avatar.

- src/views/admin/AdminDashboard.tsx — L209
  className="... bg-primary/5 dark:bg-slate-800/80 dark:border-primary/30 border-primary/20"
  Recomendación: sección decorativa — okay pero preferir token CSS (ej. `var(--bg-primary-10)`) para control centralizado.

- src/views/admin/AdminCommunication.tsx — L556
  ? 'bg-primary text-white rounded-tr-sm'
  Recomendación: si es un estado o badge interactivo, sustituir por `Button variant="primary"` o por `span` con rol y aria-label; revisar contraste.

- src/views/admin/AdminCommunication.tsx — L601
  className="... rounded-lg bg-primary hover:bg-primary-700 ..."
  Recomendación: si es un botón/CTA, usar `Button` con `variant="primary"`.

- src/views/admin/AdminClients.tsx — L304
  className="text-primary hover:bg-primary/5 dark:hover:bg-primary/20 p-2 rounded-full ..."
  Recomendación: icon-button → usar `Button variant="ghost" size="icon"` y mover estilos al `className` solo para spacing.

- src/views/admin/AdminClients.tsx — L400
  className="... bg-primary/10 dark:bg-primary/50 hover:bg-primary/20 ..."
  Recomendación: si actúa como botón (Ver detalles), usar `Button variant="secondary"` con `className` para colores si es necesario.

- src/views/admin/AdminAutomation.tsx — L222, L230, L261
  Varias ocurrencias relacionadas con indicadores de estado/toggles (bg-primary/10, bg-primary/90)
  Recomendación: conservar para indicadores visuales, pero preferir tokens semánticos (`status-success-bg`, `toggle-on-bg`) y centralizarlos.

- src/pages/Login.tsx — L103
  className="... bg-primary hover:bg-primary-600 text-white ..."
  Recomendación: botón de envío → usar `<Button variant="primary">` y evitar `bg-primary` directo.

- src/components/ConversationItem.tsx — L33-L46, L111
  Variantes usadas para item seleccionado y badge: `bg-primary/10`, `bg-primary/20`, `bg-primary text-white`.
  Recomendación: conservar para estado seleccionado, pero extraer a clase utilitaria o token para uniformidad; los items no deben usar `Button` si son list items, pero asegurar roles/accessibility.

- src/components/layout/Sidebar.tsx — L85, L126
  className="... bg-primary ..." para logo y active menu
  Recomendación: layout global — mantener `bg-primary` para sidebar/brand, pero definir variables CSS en `:root` y `@media (prefers-color-scheme)` para controlar dark contrast.

- src/components/ui/Button.tsx — L23-L29
  Nota: `Button` aún referencia `bg-primary` en su variante `primary` — esto es correcto; en modo oscuro `primary` mapea a `dark:bg-secondary`.
  Recomendación: mantener la variante en `Button` y preferir su uso en lugar de clases directas.

- src/components/layout/Header.tsx — L22
  header con `bg-primary` (barra superior)
  Recomendación: layout/global — conservar pero usar token CSS o clase utilitaria centralizada.

(El resto de ocurrencias están en archivos listados arriba; todas están incluidas en el escaneo.)

Sugerencias de migración (pasos técnicos)
1. Prioridad alta — controles interactivos (botones, icon-buttons, enlaces)
   - Reemplazar `className="bg-primary..."` por `<Button variant="primary">` o `variant="ghost"/"secondary"` según contexto.
   - Mantener `className` adicional para tamaños/espaciado (`className="w-full"`, etc.).

2. Prioridad media — layout y branding (header, sidebar, badges decorativos)
   - Mantener `bg-primary` pero mover color a variables CSS: `--color-primary`, `--color-primary-10`, etc.
   - Añadir `dark` variants en variables para control centralizado.

3. Prioridad baja — elementos decorativos (avatares con `bg-primary/10`)
   - Mantener, pero validar contraste en modo oscuro. Ajustar `dark:bg-...` si necesario.

Reemplazo de ejemplo (antes → después)
- Antes:
  <button className="bg-primary hover:bg-primary-600 text-white rounded-lg">Enviar</button>
- Después:
  <Button variant="primary" className="w-full">Enviar</Button>

Acción recomendada siguiente
- ¿Deseas que aplique automáticamente cambios para controles interactivos (reemplazos seguros por `Button`) en todo el repo? Puedo crear un PR con los cambios propuestos (fase 1: botones y icon-buttons).
- Si prefieres, puedo generar un patch sugerido y listarlo en un PR draft para revisión manual.

---
Archivo generado automáticamente por el asistente.
