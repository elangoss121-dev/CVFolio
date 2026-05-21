'use client';

import { useMemo, useState } from 'react';
import { aiAPI, uploadAPI, resumeAPI, userAPI } from '../services/api';
import { validateEmail, validatePhone, validateImageSize, validateImageType, formatFileSize } from '../services/validators';

const templates = [
  { name: 'Modern', description: 'Clean, professional layout with bold headings.' },
  { name: 'Minimal', description: 'Simple typography with clear sectioning.' },
  { name: 'Professional', description: 'Corporate look for hiring managers.' },
  { name: 'Creative', description: 'Stylish resume with unique accents.' },
];

export default function ResumeBuilderForm() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    github: '',
    portfolioUrl: '',
    address: '',
    dateOfBirth: '',
    skills: '',
    education: '',
    experience: '',
    projects: '',
    certifications: '',
    languages: '',
    about: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const skillsArray = useMemo(
    () => form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    [form.skills]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      setStatusMessage('Invalid image type. Only JPG, PNG, and WEBP are allowed.');
      return;
    }
    if (!validateImageSize(file)) {
      setStatusMessage('Image is too large. Please upload a file under 15MB.');
      return;
    }

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setStatusMessage('Uploading profile image...');
      const result = await uploadAPI.uploadImage(file);
      const savedUrl = result.data.path || result.data.filename || '';
      setImageUrl(savedUrl);
      setStatusMessage(`Uploaded: ${result.data.filename}`);
    } catch (error) {
      setStatusMessage('Image upload failed.');
    }
  };

  const parseList = (value: string) => value.split(/\n|,|;/).map((item) => item.trim()).filter(Boolean);

  const findOrCreateUser = async () => {
    if (!form.email) {
      throw new Error('Email is required to save your resume.');
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
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          linkedIn: form.linkedIn,
          github: form.github,
          portfolioUrl: form.portfolioUrl,
          address: form.address,
          dateOfBirth: form.dateOfBirth,
          about: form.about,
          imageUrl,
        });
        return createResponse.data.user;
      }
      throw error;
    }
  };

  const optimizeSummary = async () => {
    if (!form.about.trim()) {
      setStatusMessage('Please enter your summary or about section first.');
      return;
    }

    setStatusMessage('Optimizing summary with Gemini AI...');
    try {
      const response = await aiAPI.optimizeText(form.about);
      setOptimizedText(response.data.optimizedText || response.data.optimizedText);
      setStatusMessage('Summary optimized successfully.');
    } catch (error) {
      setStatusMessage('Failed to optimize text.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateEmail(form.email)) {
      setStatusMessage('Please enter a valid email.');
      return;
    }
    if (!validatePhone(form.phone)) {
      setStatusMessage('Please enter a valid phone number.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving resume to the backend...');

    try {
      const user = await findOrCreateUser();
      const resumePayload = {
        userId: user._id,
        title: `${form.fullName || 'Resume'} Resume`,
        template: selectedTemplate,
        sections: {
          summary: form.about,
          education: parseList(form.education).map((item) => ({ institution: item })),
          experience: parseList(form.experience).map((item) => ({ description: [item] })),
          projects: parseList(form.projects).map((item) => ({ title: item, description: item })),
          skills: parseList(form.skills),
          certifications: parseList(form.certifications),
          languages: parseList(form.languages),
        },
      };

      const response = await resumeAPI.create(resumePayload);
      setStatusMessage(`Resume saved successfully with ID ${response.data.resume._id}`);
    } catch (error) {
      setStatusMessage('Unable to save resume data at this time.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Resume Builder</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Collect your details, upload a profile image, choose a template, and optimize resume content with Gemini AI.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-slate-300">
            <p className="text-sm">Selected template</p>
            <p className="mt-1 text-lg font-semibold text-white">{selectedTemplate}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold">Personal & Contact</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                { label: 'Full Name', name: 'fullName', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Phone', name: 'phone', type: 'tel' },
                { label: 'LinkedIn URL', name: 'linkedIn', type: 'url' },
                { label: 'GitHub URL', name: 'github', type: 'url' },
                { label: 'Portfolio URL', name: 'portfolioUrl', type: 'url' },
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
            <h2 className="text-2xl font-semibold">Experience & Education</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Skills (comma-separated)</span>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="React, Node.js, UI Design, ATS Optimization"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Experience</span>
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="Company, role, timeframe, achievements..."
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Education</span>
                <textarea
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="School, degree, year, highlights..."
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold">Projects & About</h2>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">Projects</span>
                <textarea
                  name="projects"
                  value={form.projects}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="Project title, tech stack, outcome..."
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-slate-100">About / Summary</span>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleChange}
                  rows={5}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="Write your professional summary or career objective here..."
                />
              </label>
            </div>
            <button
              type="button"
              onClick={optimizeSummary}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Optimize Summary with Gemini AI
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Resume Draft'}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-700 px-6 py-3 text-slate-100 transition hover:border-cyan-500"
            >
              Download PDF (coming soon)
            </button>
          </div>
          {statusMessage && <p className="text-sm text-slate-300">{statusMessage}</p>}
        </div>

        <aside className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Profile Image</h3>
            <p className="mt-2 text-slate-400">Accepts JPG, PNG, WEBP up to 15MB.</p>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4 w-full text-slate-100" />
            {profileImage && (
              <p className="mt-2 text-sm text-slate-300">{profileImage.name} · {formatFileSize(profileImage.size)}</p>
            )}
            {previewUrl && <img src={previewUrl} alt="Profile preview" className="mt-4 h-40 w-40 rounded-3xl object-cover" />}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Template Gallery</h3>
            <div className="mt-5 space-y-4">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => setSelectedTemplate(template.name)}
                  className={`block w-full rounded-3xl border px-5 py-4 text-left transition ${
                    selectedTemplate === template.name
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-950/80 hover:border-slate-500'
                  }`}
                >
                  <p className="font-semibold text-white">{template.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
            <h3 className="text-xl font-semibold">Preview</h3>
            <div className="mt-5 space-y-4 rounded-3xl bg-slate-950 p-4 text-slate-300">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Summary preview</p>
              <p>{optimizedText || form.about || 'Your optimized summary will appear here.'}</p>
              <div className="mt-4 rounded-3xl bg-slate-900 p-4 text-sm text-slate-400">
                <p className="font-semibold text-slate-100">Skills</p>
                <p>{skillsArray.length ? skillsArray.join(', ') : 'Enter skills to preview here.'}</p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
