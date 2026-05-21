'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { portfolioAPI } from '../services/api';

interface PortfolioSection {
  about?: string;
  skills?: string[];
  projects?: Array<{ title?: string; description?: string; link?: string; github?: string }>;
  social?: Record<string, string>;
}

interface PortfolioData {
  title?: string;
  slug?: string;
  bio?: string;
  theme?: string;
  resumeLink?: string;
  sections?: PortfolioSection;
  userId?: any;
}

export default function PortfolioPublicView() {
  const params = useParams();
  const slug = params?.slug as string;
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPortfolio() {
      if (!slug) return;
      try {
        const response = await portfolioAPI.getBySlug(slug);
        setPortfolio(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Portfolio not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [slug]);

  const imageUrl = portfolio?.userId?.imageUrl
    ? portfolio.userId.imageUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${portfolio.userId.imageUrl}`
      : portfolio.userId.imageUrl
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
        Loading portfolio...
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300">
        <h1 className="text-3xl font-semibold text-white">Portfolio not found</h1>
        <p className="mt-4 text-slate-400">{error || 'The portfolio you are looking for does not exist.'}</p>
      </div>
    );
  }

  const socialLinks = portfolio.sections?.social || {};

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Portfolio</p>
              <h1 className="text-4xl font-semibold text-white">{portfolio.title || 'Professional Portfolio'}</h1>
              <p className="max-w-3xl text-slate-300">{portfolio.bio || portfolio.sections?.about || 'A professional portfolio created with AI-powered recommendations.'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-left transition hover:border-cyan-500">
                  <p className="text-sm text-slate-400">GitHub</p>
                  <p className="mt-2 font-semibold text-white">{socialLinks.github.replace(/^https?:\/\//, '')}</p>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-left transition hover:border-cyan-500">
                  <p className="text-sm text-slate-400">LinkedIn</p>
                  <p className="mt-2 font-semibold text-white">{socialLinks.linkedin.replace(/^https?:\/\//, '')}</p>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-left transition hover:border-cyan-500">
                  <p className="text-sm text-slate-400">Twitter</p>
                  <p className="mt-2 font-semibold text-white">{socialLinks.twitter.replace(/^https?:\/\//, '')}</p>
                </a>
              )}
              {socialLinks.email && (
                <a href={`mailto:${socialLinks.email}`} className="rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-left transition hover:border-cyan-500">
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="mt-2 font-semibold text-white">{socialLinks.email}</p>
                </a>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {portfolio.resumeLink && (
                <a href={portfolio.resumeLink} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-500 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  View Resume
                </a>
              )}
              {portfolio.sections?.skills?.length ? (
                <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {portfolio.sections.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {imageUrl ? (
            <div className="overflow-hidden rounded-3xl bg-slate-950">
              <img src={imageUrl} alt="Portfolio profile" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-3xl bg-slate-950 p-10 text-slate-400">
              No profile image available
            </div>
          )}
        </section>

        {portfolio.sections?.projects?.length ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10">
            <h2 className="text-3xl font-semibold text-white">Projects</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {portfolio.sections.projects.map((project, index) => (
                <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                  <h3 className="text-xl font-semibold text-white">{project.title || 'Untitled Project'}</h3>
                  <p className="mt-3 text-slate-400">{project.description || 'No description provided.'}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-cyan-300">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="underline">
                        Website
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="underline">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
