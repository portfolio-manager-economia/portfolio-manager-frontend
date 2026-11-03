import React, { useState } from "react";

function Logo({ ticker, url }) {
  const [failed, setFailed] = useState(false);
  return <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-100 text-slate-800" aria-hidden="true">
    {url && !failed ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-contain p-1" />
      : <span className="text-xs font-bold">{ticker.replace(/\.BA$|-USD$/, "").slice(0, 3)}</span>}
  </span>;
}

export default function AssetLogo({ ticker, url }) {
  return <Logo key={`${ticker}:${url}`} ticker={ticker} url={url} />;
}
