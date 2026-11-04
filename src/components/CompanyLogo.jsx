import { ASSET_CATALOG } from "../data/assets";

const COMPANY_LOGOS = {
  AAPL: "apple",
  "AAPL.BA": "apple",
  MSFT: "microsoft",
  "MSFT.BA": "microsoft",
  GOOGL: "google",
  "GOOGL.BA": "google",
  AMZN: "amazon",
  "AMZN.BA": "amazon",
  TSLA: "tesla",
  "TSLA.BA": "tesla",
  NVDA: "nvidia",
  "NVDA.BA": "nvidia",
  KO: "cocacola",
  "KO.BA": "cocacola",
  "BTC-USD": "bitcoin",
  BTC: "bitcoin",
  "ETH-USD": "ethereum",
  ETH: "ethereum",
  "SOL-USD": "solana",
  SOL: "solana",
};

const COMPANY_NAME_LOGOS = {
  APPLE: "apple",
  APPLEINC: "apple",
  MICROSOFT: "microsoft",
  GOOGLE: "google",
  ALPHABET: "google",
  ALPHABETGOOGLE: "google",
  AMAZON: "amazon",
  AMAZONCOM: "amazon",
  TESLA: "tesla",
  NVIDIA: "nvidia",
  COCACOLA: "cocacola",
  BITCOIN: "bitcoin",
  ETHEREUM: "ethereum",
  SOLANA: "solana",
};

function getInitials(label) {
  const words = label
    .replace(/\([^)]*\)/g, " ")
    .replace(
      /\b(?:inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|limited|class|nasdaq|s\.?a\.?|cedear|etf)\b/gi,
      " ",
    )
    .trim()
    .split(/[\s/.,_-]+/)
    .filter(Boolean);

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  return (words[0] || "").slice(0, 2).toUpperCase();
}

export default function CompanyLogo({ company, ticker, name, url, size = 34 }) {
  const value = String(company || ticker || name || "").trim();
  if (!value) return null;

  const normalizedTicker = value.toUpperCase();
  const asset = ASSET_CATALOG.find(
    (entry) => entry.ticker.toUpperCase() === normalizedTicker,
  );
  const displayName = name || asset?.name || value;
  const normalizedName = displayName
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(
      /\b(?:inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|limited|class|nasdaq|s\.?a\.?|cedear|etf)\b/gi,
      " ",
    )
    .replace(/[^A-Z0-9]+/g, "");
  const slug =
    COMPANY_LOGOS[normalizedTicker] || COMPANY_NAME_LOGOS[normalizedName];
  const version =
    slug === "microsoft" ? "12.0.0" : slug === "amazon" ? "14.0.0" : "16.36.0";
  const logoUrl = slug
    ? `https://cdn.jsdelivr.net/npm/simple-icons@${version}/icons/${slug}.svg`
    : null;
  const logoUrls = [logoUrl, url].filter(Boolean);

  return (
    <span
      className="company-logo"
      style={{ width: size, height: size }}
      title={displayName}
      aria-hidden="true"
    >
      <span className="company-logo-fallback">{getInitials(displayName)}</span>
      {logoUrls.map((logoSource) => (
        <img
          key={logoSource}
          src={logoSource}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ))}
    </span>
  );
}
