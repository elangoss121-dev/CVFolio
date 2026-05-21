import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  technologies: [String],
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startDate: String,
  endDate: String,
  details: String,
});

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  linkedIn: String,
  github: String,
  portfolioUrl: String,
  address: String,
  dateOfBirth: String,
  skills: [String],
  education: [educationSchema],
  experience: [String],
  projects: [projectSchema],
  certifications: [String],
  languages: [String],
  about: String,
  imageUrl: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
