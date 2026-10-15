# Portfolio Manager - Frontend (React + Vite)

Interfaz web interactiva para el seguimiento de carteras de inversión y optimización cuantitativa según la **Teoría Moderna de Portafolios (Markowitz)**.

Trabajo práctico de Economía y Finanzas.

---

## 🚀 Funcionalidades

1. **Seguimiento de Cartera:**
   - Valuación a precios de mercado en tiempo real.
   - Ganancia / Pérdida no realizada acumulada ($ y %).
   - Alta y baja de activos con catálogo oficial categorizado (CEDEARs, Merval, Acciones USA, Bonos y Crypto).

2. **Optimizador de Markowitz:**
   - Selector visual de activos con botones interactivos (+/-) y presets de carteras en 1 clic.
   - Gráfico de dispersión de la **Frontera Eficiente** desarrollado con `Recharts`.
   - Comparación detallada de ponderaciones: **Portafolio de Mínima Varianza Global (GMVP)** vs. **Portafolio de Máximo Sharpe (Tangencia)**.

3. **Monitor de Cotizaciones en Vivo:**
   - Cinta superior con tipos de cambio en Argentina (Oficial, MEP/Bolsa, CCL, Blue, Cripto).

4. **Teoría y Fórmulas:**
   - Resumen interactivo de retornos logarítmicos, covarianza insesgada y ratio de Sharpe.

---

## 🛠️ Tecnologías

- **Framework:** React 19 + Vite
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Estilos:** Tailwind CSS

---

## 📦 Instalación y Uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

La aplicación abrirá en `http://localhost:5173` y se conectará automáticamente al backend en `http://localhost:8000`.
