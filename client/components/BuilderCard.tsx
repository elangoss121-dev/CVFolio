interface BuilderCardProps {
  title: string;
  description: string;
}

export default function BuilderCard({ title, description }: BuilderCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/50 transition-transform duration-200 hover:-translate-y-1 hover:bg-slate-900/95">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-slate-400">{description}</p>
    </div>
  );
}
