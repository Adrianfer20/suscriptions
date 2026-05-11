import{j as e,I as i,B as u,f as y}from"./index-D-2PRUoy.js";import{u as w,r}from"./react-vendor-CrtiWHBG.js";import{C as o}from"./Card-pLz2gHhr.js";import{Q as k,V as C,j as S,o as U,M as A}from"./lucide-icons-BUkGPuL1.js";import"./firebase-core-Ch2EBEDA.js";import"./firebase-auth-BmuIUuQ8.js";function B(){const j=w(),[a,N]=r.useState(null),[f,g]=r.useState(!0),[m,x]=r.useState(!1),[t,l]=r.useState({displayName:"",phone:"",address:""});r.useEffect(()=>{let s=!0;async function v(){var h,p;try{const n=await y.me(),c=((h=n.data)==null?void 0:h.user)||((p=n.data)==null?void 0:p.data);if(!s||!c)return;const d={...c,displayName:c.displayName};N(d),l({displayName:d.displayName||"",phone:d.phone||"",address:d.address||""})}catch(n){console.error(n)}finally{s&&g(!1)}}return v(),()=>{s=!1}},[]);async function b(s){s.preventDefault(),x(!0),setTimeout(()=>{x(!1)},1e3)}return f?e.jsxs("div",{className:"max-w-4xl mx-auto animate-pulse space-y-6",children:[e.jsx("div",{className:"h-28 rounded-3xl bg-slate-200 dark:bg-slate-800"}),e.jsx("div",{className:"h-96 rounded-3xl bg-slate-200 dark:bg-slate-800"})]}):e.jsxs("div",{className:"max-w-4xl mx-auto space-y-6",children:[e.jsx("div",{className:`\r
          rounded-3xl\r
          border border-slate-200 dark:border-slate-800\r
          bg-white dark:bg-slate-900\r
          p-6\r
        `,children:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-5",children:[e.jsxs("div",{className:"relative shrink-0",children:[e.jsx("div",{className:`\r
                h-20 w-20 rounded-2xl\r
                bg-linear-to-br from-primary to-primary/80\r
                flex items-center justify-center\r
                text-white text-2xl font-bold\r
              `,children:((a==null?void 0:a.displayName)||(a==null?void 0:a.email)||"U").charAt(0).toUpperCase()}),e.jsx("div",{className:`\r
                absolute -bottom-1 -right-1\r
                h-5 w-5 rounded-full\r
                bg-emerald-500\r
                border-4 border-white dark:border-slate-900\r
              `})]}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("h1",{className:"text-2xl font-bold text-slate-900 dark:text-white",children:(a==null?void 0:a.displayName)||"Usuario"}),e.jsx("p",{className:"mt-1 text-slate-500 dark:text-slate-400",children:a==null?void 0:a.email}),e.jsx("div",{className:"mt-4 flex flex-wrap gap-2",children:e.jsxs("div",{className:`\r
                  inline-flex items-center gap-2\r
                  rounded-xl\r
                  bg-slate-100 dark:bg-slate-800\r
                  px-3 py-1.5\r
                  text-xs font-medium\r
                  text-slate-600 dark:text-slate-300\r
                `,children:[e.jsx(k,{className:"h-3.5 w-3.5"}),"Administrador"]})})]})]})}),e.jsx(o,{className:"rounded-3xl",children:e.jsxs("form",{onSubmit:b,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-semibold text-slate-900 dark:text-white",children:"Información personal"}),e.jsx("p",{className:"mt-1 text-sm text-slate-500 dark:text-slate-400",children:"Actualiza tu información de perfil."})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-5",children:[e.jsx(i,{label:"Nombre completo",value:t.displayName,onChange:s=>l({...t,displayName:s.target.value}),startContent:e.jsx(C,{className:"h-4 w-4"})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:[e.jsx(i,{label:"Teléfono",placeholder:"+56 9 1234 5678",value:t.phone,onChange:s=>l({...t,phone:s.target.value}),startContent:e.jsx(S,{className:"h-4 w-4"})}),e.jsx(i,{label:"Dirección",placeholder:"Av. Principal 123",value:t.address,onChange:s=>l({...t,address:s.target.value}),startContent:e.jsx(U,{className:"h-4 w-4"})})]}),e.jsx(i,{label:"Correo electrónico",value:(a==null?void 0:a.email)||"",disabled:!0,startContent:e.jsx(A,{className:"h-4 w-4"})})]}),e.jsxs("div",{className:`\r
              flex items-center justify-between\r
              pt-2\r
            `,children:[e.jsx("p",{className:"text-xs text-slate-500",children:"Los cambios se guardarán en tu cuenta."}),e.jsx(u,{type:"submit",disabled:m,className:"min-w-40",children:m?"Guardando...":"Guardar cambios"})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(o,{className:"rounded-3xl",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-semibold text-slate-900 dark:text-white",children:"Seguridad"}),e.jsx("p",{className:"mt-1 text-sm text-slate-500 dark:text-slate-400",children:"Gestiona el acceso y la seguridad de tu cuenta."})]}),e.jsx("div",{className:`\r
                rounded-2xl\r
                border border-slate-200 dark:border-slate-800\r
                bg-slate-50 dark:bg-slate-900/50\r
                p-4\r
              `,children:e.jsx("p",{className:"text-sm text-slate-600 dark:text-slate-300",children:"Para cambiar tu contraseña utiliza la recuperación desde login o contacta al administrador principal."})})]})}),e.jsx(o,{className:"rounded-3xl",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-semibold text-slate-900 dark:text-white",children:"Accesos"}),e.jsx("p",{className:"mt-1 text-sm text-slate-500 dark:text-slate-400",children:"Gestiona permisos y nuevos administradores."})]}),e.jsx(u,{variant:"ghost",onClick:()=>j("/admin/users"),className:"justify-start",children:"Crear administrador"})]})})]})]})}export{B as default};
