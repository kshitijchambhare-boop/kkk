require('dotenv').config();
const express = require('express'), cors = require('cors'), helmet = require('helmet'), rateLimit = require('express-rate-limit');
const connectDB = require('./config/db'), { notFound, errorHandler } = require('./middleware/error');

const isProd = process.env.NODE_ENV === 'production';

// ---- Required environment variables (fail fast with a clear message) ----
const missing = ['MONGO_URI', 'JWT_SECRET'].filter(k => !process.env[k]);
if (missing.length) { console.error(`Missing required environment variable(s): ${missing.join(', ')}. See backend/.env.example`); process.exit(1); }
if (isProd && (process.env.JWT_SECRET.length < 32 || /change_this/i.test(process.env.JWT_SECRET))) {
  console.error('JWT_SECRET is too weak for production. Use a random string of at least 32 characters.'); process.exit(1);
}

// ---- CORS: only the configured frontend origin(s) (+ localhost in development) ----
// FRONTEND_URL = origin only, no path, comma-separated for several. e.g. https://username.github.io
const strip = u => u.trim().replace(/\/+$/, '');
const allowed = (process.env.FRONTEND_URL || '').split(',').map(strip).filter(Boolean);
if (!isProd) allowed.push('http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173');
if (isProd && !allowed.length) console.warn('WARNING: FRONTEND_URL is not set - browsers will block requests from your frontend (CORS).');

const app = express();
app.set('trust proxy', 1); // Render/Railway/Fly sit behind a proxy
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin)) ? cb(null, true) : cb(null, false), // no Origin = curl/health checks
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], maxAge: 600
}));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts, please try again later' } }));

app.get('/', (q, res) => res.json({ status: 'Soil Fertility API running' }));
app.get('/health', (q, res) => res.json({ ok: true }));
app.use('/api', require('./routes')); app.use(notFound); app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log('Server on port ' + PORT)))
  .catch(e => { console.error('DB connection failed:', e.message); process.exit(1); });
