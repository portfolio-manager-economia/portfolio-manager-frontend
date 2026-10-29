import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";

export default function HelpTooltip({ label, children }) {
  const id = useId();
  const trigger = useRef(null);
  const bubble = useRef(null);
  const pinned = useRef(false);
  const timer = useRef(null);
  const [position, setPosition] = useState(null);

  function locate() {
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const above = rect.bottom + 180 > window.innerHeight && rect.top > window.innerHeight - rect.bottom;
    const space = above ? rect.top - 20 : window.innerHeight - rect.bottom - 20;
    return {
      position: "fixed",
      width,
      left: Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12)),
      ...(above
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
      zIndex: 1000,
      maxHeight: Math.max(0, Math.min(240, space)),
      overflowY: "auto",
    };
  }

  function show() {
    clearTimeout(timer.current);
    setPosition(locate());
  }

  function hide() {
    clearTimeout(timer.current);
    pinned.current = false;
    setPosition(null);
  }

  function leave() {
    if (!pinned.current && document.activeElement !== trigger.current) {
      timer.current = setTimeout(() => setPosition(null), 150);
    }
  }

  const open = position !== null;
  useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!trigger.current?.contains(event.target) && !bubble.current?.contains(event.target)) hide();
    }
    function escape(event) {
      if (event.key === "Escape") hide();
    }
    function reposition() { setPosition(locate()); }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return <>
    <button
      ref={trigger}
      type="button"
      aria-label={`Ayuda: ${label}`}
      aria-describedby={open ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={leave}
      onFocus={show}
      onBlur={() => { pinned.current = false; setPosition(null); }}
      onClick={() => { if (pinned.current) hide(); else { pinned.current = true; show(); } }}
      className="inline-flex shrink-0 items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-emerald-300 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 align-middle"
    ><CircleHelp size={16} aria-hidden="true" /></button>
    {open && createPortal(<div
      ref={bubble}
      id={id}
      role="tooltip"
      style={position}
      onMouseEnter={() => clearTimeout(timer.current)}
      onMouseLeave={leave}
      className="rounded-xl border border-slate-600 bg-slate-900 p-3 text-left text-xs font-normal normal-case tracking-normal leading-relaxed text-slate-200 shadow-xl"
    ><strong className="block mb-1 text-emerald-300">{label}</strong>{children}</div>, document.body)}
  </>;
}

export function FieldLabel({ htmlFor, children, help }) {
  return <div className="flex items-center gap-1 mb-1">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300 uppercase">{children}</label>
    <HelpTooltip label={children}>{help}</HelpTooltip>
  </div>;
}
