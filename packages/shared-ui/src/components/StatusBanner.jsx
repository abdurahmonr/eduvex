import React from 'react';

/**
 * Status Banner Component for Foundation Phase Notice
 */
export function StatusBanner({
  portalName,
  subdomain,
  port,
  status = 'Phase 01: Foundation Scaffolded'
}) {
  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wide uppercase text-slate-300">{portalName}</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400 font-mono">{status}</span>
      </div>
      <div className="flex items-center gap-4 text-slate-400 text-2xs font-mono">
        <span>Dev Port: <strong className="text-slate-200">{port}</strong></span>
        <span>Target Subdomain: <strong className="text-slate-200">{subdomain}.example.uz</strong></span>
        <span>Backend: <strong className="text-slate-200">Supabase (Shared)</strong></span>
      </div>
    </div>
  );
}
