import katex from "katex";
import { TrendingUp, Layers, Gauge, CalendarDays, ShieldCheck } from "lucide-react";
import "katex/dist/katex.min.css";
import "./TheoryPage.css";

function Formula({ children, label, inline = false }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={inline ? "theory-math-inline" : "theory-equation"}
      role="math"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: katex.renderToString(children, {
        displayMode: !inline,
        throwOnError: true,
        trust: false,
      }) }}
    />
  );
}

const sections = [
  {
    icon: TrendingUp,
    category: "Precios",
    title: "De precios a retornos",
    text: "El punto de partida es la variación del precio entre dos fechas. Usamos retornos logarítmicos: al sumarlos se obtiene el retorno logarítmico acumulado del período.",
    formulas: [
      [String.raw`r_{i,t}=\ln\!\left(\frac{P_{i,t}}{P_{i,t-1}}\right)`, "Retorno logarítmico del activo i entre t menos uno y t"],
    ],
    note: "P es el precio del activo; t indica la fecha de observación.",
  },
  {
    icon: Layers,
    category: "Diversificación",
    title: "Retorno y riesgo de la cartera",
    text: "El retorno esperado combina los retornos de los activos según su peso. El riesgo también depende de cómo se mueven entre sí: esa relación está en la matriz de covarianzas.",
    formulas: [
      [String.raw`\mu_p=\mathbf{w}^{\mathsf T}\boldsymbol{\mu}`, "Retorno esperado de la cartera: pesos transpuestos por retornos esperados"],
      [String.raw`\sigma_p^2=\mathbf{w}^{\mathsf T}\boldsymbol{\Sigma}\mathbf{w}`, "Varianza de la cartera: pesos transpuestos por covarianzas por pesos"],
    ],
    note: "La covarianza muestral se estima con denominador N − 1. La volatilidad es la raíz cuadrada de la varianza.",
  },
  {
    icon: Gauge,
    category: "Rendimiento",
    title: "Retorno por unidad de riesgo",
    text: "El ratio de Sharpe compara el retorno esperado con la tasa libre de riesgo. Entre las carteras evaluadas, el optimizador busca la de mayor ratio y, por separado, la de menor varianza.",
    formulas: [
      [String.raw`S_p=\frac{\mu_p-r_f}{\sigma_p}`, "Ratio de Sharpe: retorno esperado menos tasa libre de riesgo, dividido por volatilidad"],
    ],
    note: "El retorno, la volatilidad y la tasa libre de riesgo se expresan en términos anuales.",
  },
  {
    icon: CalendarDays,
    category: "Horizonte",
    title: "Una misma escala temporal",
    text: "Para comparar resultados, anualizamos el retorno y la volatilidad con el número de observaciones por año. Se usan 365 para carteras solo cripto y 252 cuando hay activos bursátiles.",
    formulas: [
      [String.raw`\mu_{\mathrm{anual}}=k\,\mu_{\mathrm{diario}}`, "Retorno anual: k por retorno diario"],
      [String.raw`\sigma_{\mathrm{anual}}=\sqrt{k}\,\sigma_{\mathrm{diaria}}`, "Volatilidad anual: raíz de k por volatilidad diaria"],
    ],
    note: "En carteras mixtas se usan sesiones comunes: los movimientos cripto del fin de semana se acumulan hasta la siguiente sesión compartida.",
  },
];

export default function TheoryPage() {
  return (
    <article className="theory-document" aria-labelledby="theory-title">
      <header className="theory-document-header">
        <div className="theory-hero-copy">
          <p className="theory-eyebrow"><span /> El modelo detrás de tus decisiones</p>
          <h2 id="theory-title">Cómo se calcula <br /><span>tu cartera</span></h2>
          <p className="theory-lead">Cada distribución tiene un equilibrio entre retorno y riesgo. Estas son las fórmulas que usamos para encontrarlo.</p>
          <div className="theory-hero-meta"><span>Markowitz · 1952</span><span>Valuación en USD</span></div>
        </div>
        <div className="theory-hero-visual" aria-hidden="true">
          <div className="theory-visual-heading"><span>El valor de diversificar</span><span className="theory-visual-dot" /></div>
          <svg viewBox="0 0 360 190" fill="none">
            <defs>
              <linearGradient id="theory-frontier-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#34d399" stopOpacity=".2" /><stop offset="1" stopColor="#34d399" stopOpacity="0" /></linearGradient>
            </defs>
            <path d="M36 30V158H326" stroke="#2b3d50" />
            <path d="M36 62H326M36 94H326M36 126H326M100 30V158M164 30V158M228 30V158M292 30V158" stroke="#203344" strokeDasharray="3 6" />
            <path d="M83 136C91 100 165 65 304 35V158H83Z" fill="url(#theory-frontier-fill)" />
            <path d="M83 136C91 100 165 65 304 35" stroke="#5ee0b5" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="166" cy="77" r="15" fill="#34d399" fillOpacity=".12" />
            <circle cx="166" cy="77" r="5" fill="#6ee7b7" stroke="#102b2d" strokeWidth="3" />
            <text x="36" y="18" fill="#8fa5b8" fontSize="10">Retorno</text><text x="293" y="180" fill="#8fa5b8" fontSize="10">Riesgo</text>
          </svg>
          <div className="theory-visual-caption"><span><i /> Frontera eficiente</span><span>Esquema ilustrativo</span></div>
        </div>
      </header>

      <div className="theory-reading-layout">
        <div className="theory-sections">
          {sections.map((section, index) => (
            <section className="theory-section" key={section.title} aria-labelledby={`theory-section-${index}`}>
              <div className="theory-card-topline"><span className="theory-card-icon"><section.icon size={19} strokeWidth={1.6} /></span><span>{section.category}</span><span className="theory-section-number" aria-hidden="true">0{index + 1}</span></div>
              <div className="theory-section-heading">
                <h3 id={`theory-section-${index}`}>{section.title}</h3>
              </div>
              <p>{section.text}</p>
              <div className="theory-equations">
                {section.formulas.map(([tex, label]) => <Formula key={tex} label={label}>{tex}</Formula>)}
              </div>
              <details className="theory-note"><summary>Cómo se interpreta</summary><p>{section.note}</p></details>
            </section>
          ))}
        </div>

        <aside className="theory-sidebar" aria-label="Guía de notación y criterios">
          <section>
            <div className="theory-notation-header"><h3>Las piezas del modelo</h3><p>Una guía rápida de los símbolos.</p></div>
            <dl className="theory-notation">
              {[
                [String.raw`\mathbf{w}`, "Pesos", "Proporción invertida en cada activo."],
                [String.raw`\boldsymbol{\mu}`, "Retornos esperados", "Vector de medias de los retornos."],
                [String.raw`\boldsymbol{\Sigma}`, "Covarianzas", "Matriz que describe el movimiento conjunto de los activos."],
                [String.raw`r_f`, "Tasa libre de riesgo", "Referencia utilizada para calcular Sharpe."],
                [String.raw`k`, "Observaciones por año", "252 en mercado bursátil; 365 para carteras solo cripto."],
              ].map(([tex, label, description]) => (
                <div key={tex}>
                  <dt><Formula inline label={label}>{tex}</Formula></dt>
                  <dd><strong>{label}</strong><span>{description}</span></dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="theory-currency-note">
            <h3>Resultados en USD</h3>
            <p>Para la optimización, las series de precios en pesos se convierten con el dólar MEP histórico de cada fecha.</p>
          </section>
        </aside>
      </div>

      <section className="theory-constraints" aria-labelledby="theory-constraints-title">
        <span className="theory-constraint-icon"><ShieldCheck size={24} strokeWidth={1.5} /></span>
        <div>
          <h3 id="theory-constraints-title">Condiciones de la optimización</h3>
          <p>Se distribuye el 100 % del capital entre los activos seleccionados, sin ventas en corto.</p>
        </div>
        <Formula label="La suma de los pesos es uno y cada peso es mayor o igual a cero">{String.raw`\sum_{i=1}^{n} w_i=1,\qquad w_i\geq 0`}</Formula>
      </section>
      <footer className="theory-document-footer">
        <p>Base teórica: Harry Markowitz, <cite>Portfolio Selection</cite> (1952).</p>
        <p>Las estimaciones se basan en datos históricos. No garantizan rendimientos futuros.</p>
      </footer>
    </article>
  );
}
