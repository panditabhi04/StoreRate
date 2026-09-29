import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white border-t border-slate-200/80 px-4 sm:px-6 py-4 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-slate-700">StoreRate</span>
          <span className="text-slate-300">|</span>
          <span>© {currentYear} StoreRate Platform. All rights reserved.</span>
        </div>

        {/* Center: Live System Status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-600">
            Systems Operational • 99.98%
          </span>
        </div>

        {/* Right: Quick Links & Version */}
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-indigo-600 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-indigo-600 transition-colors"
          >
            Terms
          </a>
          <a
            href="#docs"
            onClick={(e) => e.preventDefault()}
            className="hover:text-indigo-600 transition-colors"
          >
            API Docs
          </a>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
