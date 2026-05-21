# CVFolio

CVFolio is a full-stack resume and portfolio builder that uses AI-powered content generation, resume optimization, and portfolio page creation. It includes a React/Next.js frontend, an Express.js backend, image uploads, and optional MongoDB persistence with an in-memory fallback.

## Features

- Create and manage resumes with AI-enhanced summaries and descriptions.
- Build professional portfolio pages with user profile and project details.
- Upload profile images for portfolio use.
- Integrate with Google Gemini for text optimization and portfolio content generation.
- Fallback storage when MongoDB is not configured.
- GitHub Actions CI workflow for build validation.

## Tech Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB/Mongoose, Multer, dotenv
- AI Integration: Google Gemini via @google/generative-ai
- Deployment: GitHub Actions

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 2. Configure environment

Copy `server/.env.example` to `server/.env` and add your settings:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/resume_portfolio
GEMINI_API_KEY=your_gemini_api_key_here
```

If MongoDB is not available, the backend will start with in-memory fallback storage.

### 3. Run the application

Start the backend:

```bash
cd server
npm start
```

Start the frontend:

```bash
cd ../client
npm run dev
```

Open http://localhost:3000 in your browser.

## GitHub Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.
The workflow installs server and client dependencies, builds the frontend, and lints the frontend code on every push or pull request to the `main` branch.

## Vercel Deployment

This app can be deployed to Vercel using the `client` Next.js app.

1. Import the repository into Vercel.
2. Set the project root to `client` if prompted.
3. Configure the environment variable for the backend API:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

4. Add the backend `GEMINI_API_KEY` to Vercel only if you deploy the backend there or add it to the backend host provider.

If you are hosting only the frontend on Vercel, deploy the backend separately and point `NEXT_PUBLIC_API_URL` to that backend.

## API Endpoints

- `GET /` - backend health check
- `POST /api/users` - create a user
- `POST /api/resumes` - create a resume
- `POST /api/portfolios` - create a portfolio
- `POST /api/gemini/optimize` - optimize resume text with Gemini AI
- `POST /api/gemini/portfolio` - generate portfolio content with Gemini AI

## Notes

- Keep your `GEMINI_API_KEY` secret and do not expose it in frontend code.
- Use environment variables for credentials and database URIs.

## License

MIT License
