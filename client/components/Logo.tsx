export default function Logo() {
  return (
    <div className="inline-flex items-center gap-5 rounded-3xl bg-slate-900/90 px-6 py-5 shadow-lg shadow-slate-950/30">
      <svg className="h-20 w-20" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3578ff" />
            <stop offset="100%" stopColor="#8f5fff" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="90" r="18" fill="url(#logo-gradient)" />
        <path d="M 28 84 A 36 36 0 0 1 64 48" stroke="url(#logo-gradient)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 28 96 A 36 36 0 0 0 64 132" stroke="url(#logo-gradient)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 52 28 A 66 66 0 0 1 132 54" stroke="url(#logo-gradient)" strokeWidth="14" strokeLinecap="round" fill="none" />
      </svg>

      <div className="text-left">
        <div className="text-4xl font-semibold tracking-tight text-slate-100">CVFolio</div>
        <div className="mt-2 text-sm uppercase tracking-[0.35em] text-slate-400">
          Build · Showcase · Grow
        </div>
      </div>
    </div>
  );
}
