export function validateEmail(req, res, next) {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
}

export function validateResume(req, res, next) {
  const { userId, title } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ error: 'userId and title are required' });
  }

  next();
}

export function validatePortfolio(req, res, next) {
  const { userId, slug } = req.body;

  if (!userId || !slug) {
    return res.status(400).json({ error: 'userId and slug are required' });
  }

  next();
}
