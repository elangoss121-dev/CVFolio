export const GEMINI_PROMPTS = {
  optimizeResume: (text: string) =>
    `Improve this resume description for ATS optimization, grammar, strong action words, and clarity. Make it concise but impactful:\n\n${text}`,

  generateSummary: (skills: string[], experience: string[]) =>
    `Create a professional resume summary (2-3 sentences) for someone with these skills: ${skills.join(', ')} and experience in: ${experience.join(', ')}. Make it compelling and ATS-friendly.`,

  generateProjectDescription: (projectTitle: string, technologies: string[]) =>
    `Write a professional project description for a project titled "${projectTitle}" built with ${technologies.join(', ')}. Use action verbs and highlight impact. Keep it 1-2 sentences.`,

  generateBio: (role: string, skills: string[]) =>
    `Create a professional portfolio bio (2-3 sentences) for a ${role} with expertise in ${skills.join(', ')}. Make it engaging and memorable.`,

  generateATSScore: (resumeData: any) =>
    `Analyze this resume data for ATS (Applicant Tracking System) compatibility and provide a score from 0-100 with specific recommendations for improvement:\n\n${JSON.stringify(resumeData, null, 2)}`,

  suggestSkills: (currentSkills: string[], role: string) =>
    `I have these skills: ${currentSkills.join(', ')} and want to become a ${role}. Suggest 5-10 additional skills I should learn, ordered by importance.`,

  improveBulletPoint: (bulletPoint: string) =>
    `Improve this bullet point for a resume to make it more impactful, quantifiable, and ATS-friendly:\n\n${bulletPoint}`,

  generateJobDescription: (jobTitle: string, company: string, responsibilities: string[]) =>
    `Write a professional job description for a ${jobTitle} position at ${company} with these main responsibilities: ${responsibilities.join(', ')}. Use action verbs and highlight impact.`,
};

export function createResumePrompt(resumeData: any): string {
  return `Analyze and improve this resume for ATS optimization and impact:\n\n${JSON.stringify(resumeData, null, 2)}.\n\nProvide suggestions for improvement in each section.`;
}
