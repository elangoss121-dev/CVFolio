'use client';

'use client';

import ResumeBuilderForm from './ResumeBuilderForm';
import PortfolioBuilderForm from './PortfolioBuilderForm';

export default function BothBuilderForm() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/20">
        <h1 className="text-3xl font-semibold">CVFolio</h1>
        <p className="mt-3 text-slate-400">
          Enter your details once to generate both an ATS-ready resume and a professional portfolio website.
        </p>
      </section>
      <div className="grid gap-10 xl:grid-cols-2">
        <div className="space-y-8">
          <ResumeBuilderForm />
        </div>
        <div className="space-y-8">
          <PortfolioBuilderForm />
        </div>
      </div>
    </div>
  );
}
