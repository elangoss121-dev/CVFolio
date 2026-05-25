import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// User API
export const userAPI = {
  create: (userData: any) => api.post('/users', userData),
  get: (id: string) => api.get(`/users/${id}`),
  getByEmail: (email: string) => api.get('/users', { params: { email } }),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Resume API
export const resumeAPI = {
  create: (resumeData: any) => api.post('/resumes', resumeData),
  getUserResumes: (userId: string) => api.get(`/resumes/user/${userId}`),
  get: (id: string) => api.get(`/resumes/${id}`),
  update: (id: string, resumeData: any) => api.put(`/resumes/${id}`, resumeData),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  publish: (id: string) => api.post(`/resumes/${id}/publish`),
};

// Portfolio API
export const portfolioAPI = {
  create: (portfolioData: any) => api.post('/portfolios', portfolioData),
  getUserPortfolio: (userId: string) => api.get(`/portfolios/user/${userId}`),
  get: (id: string) => api.get(`/portfolios/${id}`),
  getBySlug: (slug: string) => api.get(`/portfolios/${slug}`),
  update: (id: string, portfolioData: any) => api.put(`/portfolios/${id}`, portfolioData),
  delete: (id: string) => api.delete(`/portfolios/${id}`),
  publish: (id: string) => api.post(`/portfolios/${id}/publish`),
};

// Gemini AI API
export const aiAPI = {
  optimizeText: (text: string) => api.post('/gemini/optimize', { text }),
  generatePortfolioText: (prompt: string) => api.post('/gemini/portfolio', { prompt }),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Auth API
export const authAPI = {
  googleLogin: (token: string, clientId?: string) => api.post('/auth/google', { token, clientId }),
};

// Keep legacy functions for compatibility
export async function optimizeResumeText(text: string) {
  const response = await api.post('/gemini/optimize', { text });
  return response.data;
}

export async function generatePortfolioBio(prompt: string) {
  const response = await api.post('/gemini/portfolio', { prompt });
  return response.data;
}

export default api;
