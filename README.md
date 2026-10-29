# Portfolio Manager · Frontend

Aplicación React + Vite para registrar inversiones, seguir su valor en USD y analizar distribuciones óptimas con Markowitz. Consume el backend FastAPI del repositorio hermano `portfolio-manager-backend` y usa Supabase Auth para registro, confirmación de correo e inicio/cierre de sesión.

## Pestañas

| Pestaña | Funciones |
| --- | --- |
| Mi Portafolio | Alta y eliminación de posiciones, precio y moneda nativos, fechas de cotización, costo histórico, valuación y ganancia/pérdida en USD. Actualización automática cada 60 segundos y actualización manual que evita caché. |
| Frontera Eficiente | Catálogo, carteras prearmadas, selección de ventana y tasa anual en USD. Gráfico de frontera, mínima varianza y máximo Sharpe. Comparación opcional con tu cartera: punto actual en el gráfico, métricas, pesos y cambios en puntos porcentuales. |
| Teoría & Fórmulas | Markowitz, retornos logarítmicos, covarianza, Sharpe, moneda, restricciones y calendarios de anualización. |

La barra superior consulta dólar oficial, MEP, CCL, blue y cripto cada 60 segundos, con fechas del proveedor y aviso explícito ante errores.

Los campos de registro, nueva posición y optimización, así como las principales métricas, incluyen un ícono de ayuda `?` con explicaciones y ejemplos. Se abre al pasar el mouse, enfocar con teclado o tocar el ícono; puede cerrarse con Escape o al pulsar fuera. Las ayudas se muestran sobre el modal y las tablas sin quedar recortadas por sus contenedores.

## Configuración

Node 22+ recomendado por Vite 8. Primero crear el proyecto Supabase y aplicar la migración y pruebas RLS descritas en el README del backend. Habilitar email/password y agregar `http://localhost:5173` a las URLs autorizadas de Authentication.

```powershell
npm install
Copy-Item .env.example .env
# Completar URL y clave publicable del proyecto Supabase.
npm run dev
```

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | `http://localhost:8000/api` en desarrollo |
| `VITE_SUPABASE_URL` | URL del mismo proyecto usado por el backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable o `anon`, nunca `service_role` |

Las variables `VITE_` son públicas y se incorporan al build. No poner contraseñas ni claves secretas en ellas. `.env` está ignorado por Git. Si falta configuración se muestra un estado de instalación pendiente, sin abrir una cartera compartida.

Levantar el backend en el puerto 8000. Entrar en `http://localhost:5173`, crear cuenta, confirmar el correo e iniciar sesión. La base real requiere configurar Supabase; un build exitoso por sí solo no la crea.

## Moneda y comparación

El formulario especifica la moneda de compra/cotización; el backend verifica que coincida con la del activo. Para compras ARS se puede ingresar el MEP efectivo o dejarlo vacío para estimarlo según la fecha con ArgentinaDatos. Bonos: cantidad nominal y precio por 100 VN.

Los totales, ganancias y pesos se expresan en USD. El costo usa el MEP histórico de compra guardado; la valuación usa MEP actual. Los retornos históricos se calculan con FX de cada fecha. No se suman monedas diferentes ni se usa el costo como sustituto del precio actual.

Para comparar, seleccionar “Optimizar mi cartera actual” o cargar sus activos y activar la comparación. Deben incluirse todos sus activos. Se agregan compras del mismo ticker y se usan pesos por valor de mercado; los activos nuevos tienen peso actual cero. No se ejecutan operaciones de compra/venta.

Se usa 365 para carteras solo cripto y 252 para tradicionales/mixtas alineadas a sesiones comunes. La tasa libre de riesgo de 4% es un ejemplo editable. Los datos pueden tener demora del proveedor; cuando no hay intradía se presenta el último cierre con su fecha. No se ofrece streaming de un mercado en tiempo real. Si falta alguna valuación se oculta el total incompleto.

## Verificación

```powershell
npm run build
npm run lint
npm test
```

Stack: React 19, Vite 8, Recharts, Lucide y Supabase JS. El estilo usa Tailwind CDN según la configuración original del proyecto.
