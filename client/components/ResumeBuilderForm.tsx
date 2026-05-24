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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPdf = async () => {
    if (!form.fullName.trim()) {
      setStatusMessage('Please enter your Full Name first.');
      return;
    }

    setIsDownloading(true);
    setStatusMessage('Generating PDF...');

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      // Extract skills
      const skillsList = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const summaryText = optimizedText || form.about;

      // Generate base image src if exists
      let finalImageSrc = previewUrl;
      if (!finalImageSrc && imageUrl) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const serverBase = apiBase.replace('/api', '');
        finalImageSrc = imageUrl.startsWith('http') ? imageUrl : `${serverBase}/${imageUrl}`;
      }

      // Format text blocks to html lists or paragraphs
      const formatSectionText = (text: string) => {
        if (!text) return '<p style="color: #64748b; font-style: italic;">Not specified</p>';
        return text
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            if (line.startsWith('-') || line.startsWith('*')) {
              return `<li style="margin-bottom: 6px; list-style-type: disc; margin-left: 20px; line-height: 1.5; color: #334155;">${line.substring(1).trim()}</li>`;
            }
            return `<p style="margin-bottom: 8px; line-height: 1.5; color: #334155;">${line}</p>`;
          })
          .join('');
      };

      // Styles and layout based on selected template
      let templateContent = '';

      if (selectedTemplate === 'Modern') {
        templateContent = `
          <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: white; font-size: 14px; box-sizing: border-box;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div style="flex: 1; padding-right: 20px;">
                <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.5px;">${form.fullName}</h1>
                <p style="font-size: 16px; color: #6366f1; font-weight: 600; margin: 6px 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Professional Candidate</p>
                <div style="display: flex; flex-wrap: wrap; gap: 12px 18px; font-size: 13px; color: #475569;">
                  ${form.email ? `<div><span style="font-weight: 600; color: #0f172a;">Email:</span> ${form.email}</div>` : ''}
                  ${form.phone ? `<div><span style="font-weight: 600; color: #0f172a;">Phone:</span> ${form.phone}</div>` : ''}
                  ${form.linkedIn ? `<div><span style="font-weight: 600; color: #0f172a;">LinkedIn:</span> ${form.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                  ${form.github ? `<div><span style="font-weight: 600; color: #0f172a;">GitHub:</span> ${form.github.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                  ${form.portfolioUrl ? `<div><span style="font-weight: 600; color: #0f172a;">Portfolio:</span> ${form.portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                  ${form.address ? `<div><span style="font-weight: 600; color: #0f172a;">Address:</span> ${form.address}</div>` : ''}
                </div>
              </div>
              ${finalImageSrc ? `
                <div style="flex-shrink: 0;">
                  <img src="${finalImageSrc}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #6366f1;" />
                </div>
              ` : ''}
            </div>

            <div style="border-bottom: 2px solid #e2e8f0; margin-bottom: 24px;"></div>

            <!-- About / Summary -->
            ${summaryText ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Professional Summary</h2>
                <div style="color: #334155; line-height: 1.6; font-size: 13.5px;">${summaryText}</div>
              </div>
            ` : ''}

            <!-- Skills -->
            ${skillsList.length ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Core Skills</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${skillsList.map(skill => `<span style="background: #f1f5f9; color: #334155; padding: 5px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 500; border: 1px solid #e2e8f0;">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Experience -->
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Work Experience</h2>
              <div>${formatSectionText(form.experience)}</div>
            </div>

            <!-- Education -->
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
              <div>${formatSectionText(form.education)}</div>
            </div>

            <!-- Projects -->
            ${form.projects ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #6366f1; padding-left: 10px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Key Projects</h2>
                <div>${formatSectionText(form.projects)}</div>
              </div>
            ` : ''}
          </div>
        `;
      } else if (selectedTemplate === 'Minimal') {
        templateContent = `
          <div style="font-family: 'Georgia', serif; padding: 45px; color: #111827; background: white; font-size: 13.5px; box-sizing: border-box;">
            <!-- Header Centered -->
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="font-size: 28px; font-weight: 400; color: #000; margin: 0 0 8px 0; letter-spacing: 1px; text-transform: uppercase;">${form.fullName}</h1>
              <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 14px; font-size: 12px; color: #4b5563; font-family: sans-serif;">
                ${form.email ? `<div>${form.email}</div>` : ''}
                ${form.phone ? `<div>• &nbsp; ${form.phone}</div>` : ''}
                ${form.address ? `<div>• &nbsp; ${form.address}</div>` : ''}
                ${form.linkedIn ? `<div>• &nbsp; ${form.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                ${form.github ? `<div>• &nbsp; ${form.github.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
              </div>
            </div>

            <div style="border-bottom: 1px solid #d1d5db; margin-bottom: 20px;"></div>

            <!-- Summary -->
            ${summaryText ? `
              <div style="margin-bottom: 20px; text-align: justify; line-height: 1.5;">
                <p style="margin: 0;">${summaryText}</p>
              </div>
            ` : ''}

            <!-- Experience -->
            <div style="margin-bottom: 22px;">
              <h2 style="font-size: 13px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin: 0 0 10px 0; font-family: sans-serif;">Experience</h2>
              <div style="line-height: 1.5;">${formatSectionText(form.experience)}</div>
            </div>

            <!-- Education -->
            <div style="margin-bottom: 22px;">
              <h2 style="font-size: 13px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin: 0 0 10px 0; font-family: sans-serif;">Education</h2>
              <div style="line-height: 1.5;">${formatSectionText(form.education)}</div>
            </div>

            <!-- Projects -->
            ${form.projects ? `
              <div style="margin-bottom: 22px;">
                <h2 style="font-size: 13px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin: 0 0 10px 0; font-family: sans-serif;">Projects</h2>
                <div style="line-height: 1.5;">${formatSectionText(form.projects)}</div>
              </div>
            ` : ''}

            <!-- Skills -->
            ${skillsList.length ? `
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin: 0 0 10px 0; font-family: sans-serif;">Skills</h2>
                <p style="margin: 0; line-height: 1.5; color: #374151;">${skillsList.join(', ')}</p>
              </div>
            ` : ''}
          </div>
        `;
      } else if (selectedTemplate === 'Professional') {
        templateContent = `
          <div style="font-family: 'Inter', sans-serif; padding: 0; color: #1e293b; background: white; font-size: 13.5px; box-sizing: border-box; display: flex; flex-direction: column; min-height: 100%;">
            <!-- Blue Navy Top Banner -->
            <div style="background: #1e3a8a; color: white; padding: 30px 40px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #ffffff;">${form.fullName}</h1>
                <p style="font-size: 14px; margin: 5px 0 0 0; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Executive Candidate</p>
              </div>
              ${finalImageSrc ? `
                <img src="${finalImageSrc}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 2px solid #ffffff;" />
              ` : ''}
            </div>

            <!-- Two Column Layout Body -->
            <div style="display: flex; flex: 1; padding: 30px 40px; gap: 30px;">
              <!-- Sidebar Left Column (30%) -->
              <div style="width: 30%; border-right: 1px solid #e2e8f0; padding-right: 20px;">
                <!-- Contact Info -->
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">Contact</h3>
                  <div style="font-size: 12.5px; color: #475569; display: flex; flex-direction: column; gap: 8px;">
                    ${form.email ? `<div><strong>Email:</strong><br/>${form.email}</div>` : ''}
                    ${form.phone ? `<div><strong>Phone:</strong><br/>${form.phone}</div>` : ''}
                    ${form.linkedIn ? `<div><strong>LinkedIn:</strong><br/>${form.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                    ${form.github ? `<div><strong>GitHub:</strong><br/>${form.github.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                    ${form.portfolioUrl ? `<div><strong>Portfolio:</strong><br/>${form.portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                    ${form.address ? `<div><strong>Address:</strong><br/>${form.address}</div>` : ''}
                  </div>
                </div>

                <!-- Skills -->
                ${skillsList.length ? `
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">Key Skills</h3>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                      ${skillsList.map(skill => `<div style="background: #f8fafc; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #334155; border: 1px solid #f1f5f9; font-weight: 500;">${skill}</div>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- Main Right Column (70%) -->
              <div style="width: 70%;">
                <!-- Summary -->
                ${summaryText ? `
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Executive Summary</h3>
                    <div style="color: #334155; line-height: 1.5; font-size: 13px;">${summaryText}</div>
                  </div>
                ` : ''}

                <!-- Experience -->
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Professional History</h3>
                  <div style="line-height: 1.5;">${formatSectionText(form.experience)}</div>
                </div>

                <!-- Education -->
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Education</h3>
                  <div style="line-height: 1.5;">${formatSectionText(form.education)}</div>
                </div>

                <!-- Projects -->
                ${form.projects ? `
                  <div>
                    <h3 style="font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Notable Projects</h3>
                    <div style="line-height: 1.5;">${formatSectionText(form.projects)}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      } else { // Creative Template
        templateContent = `
          <div style="font-family: 'Outfit', 'Inter', sans-serif; padding: 40px; color: #334155; background: white; font-size: 13.5px; box-sizing: border-box;">
            <!-- Modern Header with Accent Background banner -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 16px; display: flex; align-items: center; gap: 24px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(13, 148, 136, 0.15);">
              ${finalImageSrc ? `
                <img src="${finalImageSrc}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255, 255, 255, 0.3);" />
              ` : ''}
              <div>
                <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: -0.5px;">${form.fullName}</h1>
                <p style="font-size: 14px; margin: 6px 0 0 0; color: #2dd4bf; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Creative Thinker & Builder</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 12.5px; color: #cbd5e1; margin-top: 10px;">
                  ${form.email ? `<div>📧 ${form.email}</div>` : ''}
                  ${form.phone ? `<div>📞 ${form.phone}</div>` : ''}
                  ${form.linkedIn ? `<div>💼 ${form.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                  ${form.github ? `<div>💻 ${form.github.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                  ${form.portfolioUrl ? `<div>🌐 ${form.portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>` : ''}
                </div>
              </div>
            </div>

            <!-- Summary -->
            ${summaryText ? `
              <div style="margin-bottom: 25px; background: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px 20px; border-radius: 0 12px 12px 0;">
                <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Introduction</h3>
                <div style="color: #334155; line-height: 1.6; font-size: 13px;">${summaryText}</div>
              </div>
            ` : ''}

            <!-- Split Two Columns -->
            <div style="display: flex; gap: 30px;">
              <div style="width: 65%;">
                <!-- Experience -->
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Professional Path</h3>
                  <div style="line-height: 1.5;">${formatSectionText(form.experience)}</div>
                </div>

                <!-- Projects -->
                ${form.projects ? `
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Key Work</h3>
                    <div style="line-height: 1.5;">${formatSectionText(form.projects)}</div>
                  </div>
                ` : ''}
              </div>

              <div style="width: 35%;">
                <!-- Skills Tags -->
                ${skillsList.length ? `
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Core Stack</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                      ${skillsList.map(skill => `<span style="background: #ccfbf1; color: #115e59; padding: 4px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 600; border: 1px solid #99f6e4;">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Education -->
                <div>
                  <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Education</h3>
                  <div style="line-height: 1.5; font-size: 12.5px;">${formatSectionText(form.education)}</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Create a temporary element to hold the resume content
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      container.innerHTML = templateContent;
      document.body.appendChild(container);

      // PDF options
      const opt = {
        margin: 0,
        filename: `${form.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      // Generate the PDF
      await html2pdf().set(opt).from(container).save();

      // Clean up
      document.body.removeChild(container);
      setStatusMessage('PDF generated and downloaded successfully!');
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
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
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="rounded-full border border-slate-700 px-6 py-3 text-slate-100 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
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
