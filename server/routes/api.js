import express from 'express';
import { optimizeText, generatePortfolioText } from '../controllers/geminiController.js';
import { createUser, getUser, getUserByEmail, updateUser, deleteUser } from '../controllers/userController.js';
import { createResume, getUserResumes, getResume, updateResume, deleteResume, publishResume } from '../controllers/resumeController.js';
import { createPortfolio, getUserPortfolio, getPortfolioBySlug, updatePortfolio, deletePortfolio, publishPortfolio } from '../controllers/portfolioController.js';
import { uploadImage, uploadMiddleware } from '../controllers/uploadController.js';
import { validateEmail, validateResume, validatePortfolio } from '../middleware/validation.js';

const router = express.Router();

// User Routes
router.post('/users', validateEmail, createUser);
router.get('/users/:id', getUser);
router.get('/users', getUserByEmail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Resume Routes
router.post('/resumes', validateResume, createResume);
router.get('/resumes/user/:userId', getUserResumes);
router.get('/resumes/:id', getResume);
router.put('/resumes/:id', updateResume);
router.delete('/resumes/:id', deleteResume);
router.post('/resumes/:id/publish', publishResume);

// Portfolio Routes
router.post('/portfolios', validatePortfolio, createPortfolio);
router.get('/portfolios/user/:userId', getUserPortfolio);
router.get('/portfolios/:slug', getPortfolioBySlug);
router.put('/portfolios/:id', updatePortfolio);
router.delete('/portfolios/:id', deletePortfolio);
router.post('/portfolios/:id/publish', publishPortfolio);

// AI & Gemini Routes
router.post('/gemini/optimize', optimizeText);
router.post('/gemini/portfolio', generatePortfolioText);

// Upload Routes
router.post('/upload/image', uploadMiddleware.single('image'), uploadImage);

export default router;
