# Guía de UI / UX — Reglas y Convenciones

Propósito: definir reglas obligatorias para mantener consistencia visual entre las secciones `admin` y `client`, y facilitar el trabajo futuro del equipo.

Resumen rápido
- Usar siempre el componente `Button` ubicado en `src/components/ui/Button.tsx` para cualquier elemento interactivo que funcione como botón.
- Evitar `button` nativo salvo en casos muy puntuales (inputs sin estilo o accesibilidad muy específica). Cuando se use nativo, documentar la razón.
- Centralizar notificaciones con `react-hot-toast` (Toaster ya existe en `src/main.tsx`). No usar `alert`/`confirm`/banners ad-hoc.

Reglas obligatorias
- Botones
  - Todos los botones deben usar `Button` y no clases `bg-primary` directamente.
  - Variantes recomendadas:
    - `primary`: acciones principales en pantallas grandes (forms submit, CTA). En modo `dark` `primary` ya aplica `dark:bg-secondary` por defecto para asegurar contraste.
    - `secondary`: acciones secundarias (dialogs, cancelar, guardar opciones).
    - `ghost`: icon-only o controles discretos (toggles, icon buttons). Usar `size="icon"` cuando sea solo ícono.
    - `outline`: cuando exista un botón de bajo peso visual que además necesita borde.
    - `destructive`: eliminar o acciones irreversibles.
  - Evitar mezclar `bg-*` personalizados en los componentes; preferir `className` para ajustes menores (padding, gap, width).

- Estados y badges
  - Los estados de suscripción (activo, por vencer, suspendido...) deben mostrarse con un `span` pequeño dentro del componente y no competir visualmente con el CTA principal.
  - Usar colores de `STATUS_CONFIG` centralizados cuando exista.

- Mensajes / Feedback
  - Reemplazar `alert` y `confirm` por `toast` (`toast.success`, `toast.error`, `toast.loading`) para consistencia.
  - Para confirmaciones irreversibles, usar un modal con `Button variant="outline"` (Cancelar) y `Button variant="destructive"` (Confirmar).

- Dark Mode
  - `Button` ya aplica reglas para contraste en modo oscuro. Si se detecta un botón que pierde contraste, ajustar `variant` en lugar de cambiar `bg-*` directamente.

- Componentes y exportaciones
  - Todos los componentes interactivos deben exportarse desde `src/components` o `src/components/ui` si son componentes reutilizables.
  - Documentar componentes nuevos en esta guía con ejemplos de uso.

Ejemplos rápidos
- Botón principal (enviar formulario):

```tsx
import { Button } from 'src/components/ui/Button'

<Button type="submit" variant="primary">Guardar</Button>
```

- Icon button:

```tsx
<Button variant="ghost" size="icon" aria-label="Cerrar">✕</Button>
```

- Confirmación (modal):

```tsx
<Button variant="outline">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>
```

Lista de tareas recomendadas (futuro)
- Migrar fetches a TanStack Query para manejar cache y estados de carga/errores.
- Añadir tests unitarios/integ para `Button` y para las reglas de accesibilidad (contraste, focus ring).
- Crear un storybook mínimo para validar interacciones y variantes de `Button`.

Contacto
- Mantén este archivo actualizado cuando se introduzcan nuevas variantes o reglas.

---
Generado el: 28/02/2026
