import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    slug: { type: String, unique: true },
    bio: String,
    theme: { type: String, default: 'light' },
    sections: {
      about: String,
      skills: [String],
      projects: [
        {
          title: String,
          description: String,
          image: String,
          technologies: [String],
          link: String,
          github: String,
        },
      ],
      social: {
        github: String,
        linkedin: String,
        twitter: String,
        instagram: String,
        email: String,
      },
    },
    resumeLink: String,
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);
