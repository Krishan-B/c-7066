import path from 'path';
import cors from 'cors';
import express from 'express';

import { env } from './config';
import { setupRoutes } from './routes';

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Set up API routes
setupRoutes(app);

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
