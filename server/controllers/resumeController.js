import Resume from '../models/Resume.js';
import { connected } from '../config/db.js';
import {
  createResume as createResumeRecord,
  findResumesByUserId,
  findResumeById,
  updateResume as updateResumeRecord,
  deleteResume as deleteResumeRecord,
  populateUser,
} from '../data/store.js';

export async function createResume(req, res) {
  try {
    if (!connected) {
      const resume = createResumeRecord({
        userId: req.body.userId,
        title: req.body.title,
        template: req.body.template || 'Modern',
        sections: req.body.sections || {},
        atsScore: req.body.atsScore || 0,
        isDraft: typeof req.body.isDraft === 'boolean' ? req.body.isDraft : true,
      });
      return res.status(201).json({ message: 'Resume created', resume });
    }

    const { userId, title, template, sections, atsScore, isDraft } = req.body;
    const resume = new Resume({
      userId,
      title,
      template: template || 'Modern',
      sections: sections || {},
      atsScore: atsScore || 0,
      isDraft: typeof isDraft === 'boolean' ? isDraft : true,
    });
    await resume.save();
    res.status(201).json({ message: 'Resume created', resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resume', details: error.message });
  }
}

export async function getUserResumes(req, res) {
  try {
    const { userId } = req.params;
    if (!connected) {
      const resumeList = findResumesByUserId(userId);
      return res.json(resumeList);
    }
    const resumes = await Resume.find({ userId });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes', details: error.message });
  }
}

export async function getResume(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const resume = findResumeById(id);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      return res.json(populateUser(resume));
    }
    const resume = await Resume.findById(id).populate('userId');
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume', details: error.message });
  }
}

export async function updateResume(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const resume = updateResumeRecord(id, req.body);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      return res.json({ message: 'Resume updated', resume });
    }
    const resume = await Resume.findByIdAndUpdate(id, req.body, { new: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume updated', resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resume', details: error.message });
  }
}

export async function deleteResume(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const resume = deleteResumeRecord(id);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      return res.json({ message: 'Resume deleted' });
    }
    const resume = await Resume.findByIdAndDelete(id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume', details: error.message });
  }
}

export async function publishResume(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const resume = updateResumeRecord(id, { isDraft: false });
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      return res.json({ message: 'Resume published', resume });
    }
    const resume = await Resume.findByIdAndUpdate(id, { isDraft: false }, { new: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume published', resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish resume', details: error.message });
  }
}
