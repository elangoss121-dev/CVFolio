import mongoose from 'mongoose';

const resumeTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: String,
  description: String,
  thumbnail: String,
  component: String,
  isActive: { type: Boolean, default: true },
});

const portfolioTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: String,
  description: String,
  thumbnail: String,
  component: String,
  theme: String,
  isActive: { type: Boolean, default: true },
});

export const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);
export const PortfolioTemplate = mongoose.model('PortfolioTemplate', portfolioTemplateSchema);
