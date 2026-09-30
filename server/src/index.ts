import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import activationRoutes from './routes/activation.js';
import categoriesRoutes from './routes/categories.js';
import leadsRoutes from './routes/leads.js';
import campaignsRoutes from './routes/campaigns.js';
import emailsRoutes from './routes/emails.js';
import activityRoutes from './routes/activity.js';
import settingsRoutes from './routes/settings.js';
import webhooksRoutes from './routes/webhooks.js';
import { errorHandler } from './middleware/errorHandler.js';
import { activationMiddleware } from './middleware/activation.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Webhook routes (no activation middleware)
app.use('/api/webhooks', webhooksRoutes);

// Protected routes
app.use('/api/activation', activationRoutes);
app.use('/api/categories', activationMiddleware, categoriesRoutes);
app.use('/api/leads', activationMiddleware, leadsRoutes);
app.use('/api/campaigns', activationMiddleware, campaignsRoutes);
app.use('/api/emails', activationMiddleware, emailsRoutes);
app.use('/api/activity', activationMiddleware, activityRoutes);
app.use('/api/settings', activationMiddleware, settingsRoutes);

app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Lead Forge server running on port ${PORT}`);
  });
}
