import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import parcelRoutes from './routes/parcels.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { connectDatabase, getDatabaseHealth, sanitizeMongoUri } from './config/database.js';

const app = express();

app.disable('x-powered-by');

// Build allowed CORS origins
const configuredOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https:'],
        connectSrc: ["'self'", 'https:', 'http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');

      // In development or if explicitly configured, allow matching origin
      const isAllowedConfig = configuredOrigins.includes(cleanOrigin);
      const isLocalDev =
        process.env.NODE_ENV !== 'production' &&
        (/^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/).test(cleanOrigin);

      if (isAllowedConfig || isLocalDev) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests. Please try again later.'
    }
  })
);

// Comprehensive health check reporting database connectivity accurately
app.get('/api/health', (_req, res) => {
  const dbHealth = getDatabaseHealth();
  const isHealthy = dbHealth.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'DoorDash Courier API',
    database: dbHealth,
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

// Validate essential configuration before starting
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('FATAL CONFIGURATION ERROR: Missing required MONGODB_URI or JWT_SECRET in environment.');
  console.error('Please configure backend/.env before running the application.');
  process.exit(1);
}

try {
  // Connect to database before listening for traffic
  await connectDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`DoorDash Courier API successfully listening on port ${port}`);
    console.log(`Health check ready at http://localhost:${port}/api/health`);
  });
} catch (error) {
  console.error('Server startup halted: Unable to connect to database.');
  console.error('Check database connection configuration or network connectivity.');
  process.exit(1);
}
