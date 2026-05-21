'use client';

import { useState } from 'react';
import { aiAPI, uploadAPI, portfolioAPI, userAPI } from '../services/api';
import { validateEmail, validateUrl, validateImageSize, validateImageType } from '../services/validators';

const defaultLinks = [
  { name: 'GitHub', field: 'github' },
  { name: 'LinkedIn', field: 'linkedin' },
  { name: 'Twitter/X', field: 'twitter' },
  { name: 'Instagram', field: 'instagram' },
  { name: 'Email', field: 'email' },
];

export default function PortfolioBuilderForm() {
  const [form, setForm] = useState({
    name: '',
    role: '',
    bio: '',
    skills: '',
    projectTitle: '',
    projectDescription: '',
    projectLink: '',
    github: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    email: '',
    resumeLink: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      setStatusMessage('Invalid image type. Use JPG, PNG, or WEBP.');
      return;
    }
    if (!validateImageSize(file)) {
      setStatusMessage('Image must be under 15MB.');
      return;
    }

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setStatusMessage('Uploading image...');
      const result = await uploadAPI.uploadImage(file);
      const savedUrl = result.data.path || result.data.filename || '';
      setImageUrl(savedUrl);
      setStatusMessage(`Uploaded: ${result.data.filename}`);
    } catch (error) {
      setStatusMessage('Upload failed.');
    }
  };

  const parseList = (value: string) => value.split(/\n|,|;/).map((item) => item.trim()).filter(Boolean);

  const findOrCreateUser = async () => {
    if (!form.email) {
      const createResponse = await userAPI.create({
        fullName: form.name || 'Portfolio User',
        github: form.github,
        linkedIn: form.linkedin,
        email: form.email,
      });
      return createResponse.data.user;
    }

    try {
      const response = await userAPI.getByEmail(form.email);
      if (imageUrl && response.data && !response.data.imageUrl) {
        await userAPI.update(response.data._id, { imageUrl });
      }
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const createResponse = await userAPI.create({
          fullName: form.name || 'Portfolio User',
          email: form.email,
          github: form.github,
          linkedIn: form.linkedin,
          imageUrl,
        });
        return createResponse.data.user;
      }
      throw error;
    }
  };

  const generateBio = async () => {
    if (!form.role || !form.skills) {
      setStatusMessage('Please add a role and skills first.');
      return;
    }

    setStatusMessage('Generating portfolio bio with Gemini AI...');
    try {
      const response = await aiAPI.generatePortfolioText(`Role: ${form.role}\nSkills: ${form.skills}`);
      setForm((prev) => ({ ...prev, bio: response.data.portfolioText || prev.bio }));
      setStatusMessage('Portfolio bio generated successfully.');
    } catch (error) {
      setStatusMessage('Failed to generate portfolio bio.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email || !validateEmail(form.email)) {
      setStatusMessage('Please enter a valid email.');
      return;
    }
    if (form.github && !validateUrl(form.github)) {
      setStatusMessage('Please enter a valid GitHub URL.');
      return;
    }

    setStatusMessage('Saving portfolio to the backend...');

    try {
      const user = await findOrCreateUser();
      const slug = form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `portfolio-${Date.now()}`;
      const portfolioPayload = {
        userId: user._id,
        title: `${form.name || 'Portfolio'} Website`,
        slug,
        bio: form.bio,
        theme,
        sections: {
          about: form.bio,
          skills: parseList(form.skills),
          projects: [
            {
              title: form.projectTitle,
              description: form.projectDescription,
              link: form.projectLink,
              technologies: parseList(''),
            },
          ].filter((project) => project.title || project.description || project.link),
          social: {
            github: form.github,
            linkedin: form.linkedin,
            twitter: form.twitter,
            instagram: form.instagram,
            email: form.email,
          },
        },
        resumeLink: form.resumeLink,
        isPublished: true,
      };

      const response = await portfolioAPI.create(portfolioPayload);
      setStatusMessage(`Portfolio saved successfully with slug ${response.data.portfolio.slug}`);
    } catch (error) {
      setStatusMessage('Unable to save portfolio data at this time.');
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/20">
        <h1 className="text-3xl font-semibold">Portfolio Builder</h1>
        <p className="mt-3 text-slate-400">
          Build a portfolio landing page with social links, projects, and AI-generated bio content.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold">Profile Details</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'role', label: 'Role', type: 'text' },
                { name: 'resumeLink', label: 'Resume URL', type: 'url' },
              ].map((field) => (
                <label key={field.name} className="block text-sm text-slate-300">
                  <span className="text-slate-100">{field.label}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                    placeholder={field.label}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold">Portfolio Content</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Skills</span>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="React, Next.js, Node.js, Tailwind"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Bio</span>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="Add your portfolio summary or let AI generate it for you."
                />
              </label>
            </div>
            <button
              type="button"
              onClick={generateBio}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Generate Bio with Gemini AI
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold">Featured Project</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Project Title</span>
                <input
                  name="projectTitle"
                  value={form.projectTitle}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Project Description</span>
                <textarea
                  name="projectDescription"
                  value={form.projectDescription}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Project Link</span>
                <input
                  name="projectLink"
                  type="url"
                  value={form.projectLink}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Save Portfolio Draft
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-full border border-slate-700 px-6 py-3 text-slate-100 transition hover:border-cyan-500"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
            </button>
          </div>
          {statusMessage && <p className="text-sm text-slate-300">{statusMessage}</p>}
        </div>

        <aside className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Social & Links</h3>
            <div className="mt-6 space-y-4">
              {defaultLinks.map((link) => (
                <label key={link.field} className="block text-sm text-slate-300">
                  <span className="text-slate-100">{link.name}</span>
                  <input
                    name={link.field}
                    type={link.field === 'email' ? 'email' : 'url'}
                    value={form[link.field as keyof typeof form]}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                    placeholder={`https://...`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Profile Image</h3>
            <p className="mt-2 text-slate-400">Upload a professional photo for your portfolio hero section.</p>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4 w-full text-slate-100" />
            {previewUrl && <img src={previewUrl} alt="Profile preview" className="mt-4 h-40 w-full rounded-3xl object-cover" />}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Live Preview</h3>
            <div className={`mt-5 rounded-3xl p-5 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-950'}`}>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{form.role || 'Your role here'}</p>
              <h2 className="mt-3 text-2xl font-semibold">{form.name || 'Your Name'}</h2>
              <p className="mt-3 text-slate-500">{form.bio || 'AI-generated portfolio bio will appear here.'}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>Skills: {form.skills || 'Add your skills.'}</p>
                <p>Project: {form.projectTitle || 'Project title'}</p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
