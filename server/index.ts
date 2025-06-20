import path from 'path';
import cors from 'cors';
import express from 'express';

import { env } from './config';
import { setupRoutes } from './routes';
// Import monitoring routes
import monitorRoutes from './routes/monitor';

// Initialize express app
const app = express();

// Middlewares
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : 'http://localhost:8080',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

// Set up API routes
setupRoutes(app);

// Add monitoring routes
app.use('/api/monitor', monitorRoutes);

// Serve static files in production
if (env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(clientPath));
  app.get('*', (_, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Start server
const port = env.PORT;
app.listen(port, () => {
  console.warn(`Server running on port ${port}`);
});

export default app;
