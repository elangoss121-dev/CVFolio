import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    template: { type: String, default: 'Modern' },
    sections: {
      summary: String,
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
          details: String,
        },
      ],
      experience: [
        {
          company: String,
          position: String,
          startDate: String,
          endDate: String,
          description: [String],
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      skills: [String],
      certifications: [String],
      languages: [String],
    },
    atsScore: { type: Number, default: 0 },
    isDraft: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
