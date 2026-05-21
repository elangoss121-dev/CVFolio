import Link from 'next/link';
import BuilderCard from '../components/BuilderCard';
import Logo from '../components/Logo';

const options = [
  { title: 'Resume Builder', description: 'Create ATS-friendly resumes with AI help', href: '/resume' },
  { title: 'Portfolio Builder', description: 'Generate modern portfolio pages and links', href: '/portfolio' },
  { title: 'Resume + Portfolio', description: 'Build both in one flow', href: '/both' },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex flex-col items-center gap-6">
          <Logo />
          <p className="max-w-2xl text-slate-300 sm:text-lg">
            Build resumes and portfolio websites with ATS optimization, smart Gemini AI prompts, and instant template previews.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {options.map((option) => (
          <Link key={option.title} href={option.href}>
            <BuilderCard title={option.title} description={option.description} />
          </Link>
        ))}
      </div>
    </main>
  );
}
