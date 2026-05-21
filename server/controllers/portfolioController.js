import Portfolio from '../models/Portfolio.js';
import { connected } from '../config/db.js';
import {
  createPortfolio as createPortfolioRecord,
  findPortfolioByUserId,
  findPortfolioBySlug,
  updatePortfolio as updatePortfolioRecord,
  deletePortfolio as deletePortfolioRecord,
  populateUser,
} from '../data/store.js';

export async function createPortfolio(req, res) {
  try {
    if (!connected) {
      const portfolio = createPortfolioRecord({
        userId: req.body.userId,
        title: req.body.title,
        slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/\s+/g, '-') : `portfolio-${Date.now()}`),
        bio: req.body.bio,
        theme: req.body.theme || 'light',
        sections: req.body.sections || {},
        resumeLink: req.body.resumeLink,
        isPublished: typeof req.body.isPublished === 'boolean' ? req.body.isPublished : true,
      });
      return res.status(201).json({ message: 'Portfolio created', portfolio });
    }

    const { userId, title, slug, bio, theme, sections, resumeLink, isPublished } = req.body;
    const portfolio = new Portfolio({
      userId,
      title,
      slug: slug || (title ? title.toLowerCase().replace(/\s+/g, '-') : `portfolio-${Date.now()}`),
      bio,
      theme: theme || 'light',
      sections: sections || {},
      resumeLink,
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
    });
    await portfolio.save();
    res.status(201).json({ message: 'Portfolio created', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create portfolio', details: error.message });
  }
}

export async function getUserPortfolio(req, res) {
  try {
    const { userId } = req.params;
    if (!connected) {
      const portfolio = findPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      return res.json(portfolio);
    }
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio', details: error.message });
  }
}

export async function getPortfolioBySlug(req, res) {
  try {
    const { slug } = req.params;
    if (!connected) {
      const portfolio = findPortfolioBySlug(slug, true);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      return res.json(populateUser(portfolio));
    }
    const portfolio = await Portfolio.findOne({ slug, isPublished: true }).populate('userId');
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio', details: error.message });
  }
}

export async function updatePortfolio(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const portfolio = updatePortfolioRecord(id, req.body);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      return res.json({ message: 'Portfolio updated', portfolio });
    }
    const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, { new: true });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json({ message: 'Portfolio updated', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portfolio', details: error.message });
  }
}

export async function deletePortfolio(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const portfolio = deletePortfolioRecord(id);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      return res.json({ message: 'Portfolio deleted' });
    }
    const portfolio = await Portfolio.findByIdAndDelete(id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json({ message: 'Portfolio deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio', details: error.message });
  }
}

export async function publishPortfolio(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const portfolio = updatePortfolioRecord(id, { isPublished: true });
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      return res.json({ message: 'Portfolio published', portfolio });
    }
    const portfolio = await Portfolio.findByIdAndUpdate(id, { isPublished: true }, { new: true });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json({ message: 'Portfolio published', portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish portfolio', details: error.message });
  }
}
