import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { connectToDatabase } from './config/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(compression());
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  res.json({ message: 'CVFolio API is running' });
});

app.use('/uploads', express.static('uploads', { maxAge: '1d', etag: true }));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase(process.env.MONGODB_URI);
    } else {
      console.warn('No MongoDB URI configured. Running with in-memory fallback store.');
    }

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
