import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoute from './routes/health.js';
import adminAuthRoute from './routes/adminAuth.js';
import { firestore } from './firebaseAdmin.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ message: 'Fish Market Backend', minimal: true }));
app.use('/health', healthRoute);

app.get('/health/firebase', async (req, res, next) => {
  try {
    const snap = await firestore.doc('_health/ping').get();
    res.json({ ok: true, firestore: true, exists: snap.exists });
  } catch (err) {
    res.status(503).json({
      ok: false,
      firestore: false,
      error: err?.message || String(err),
      hint:
        'Firestore returned NOT_FOUND. Ensure Firestore Database is created for project fish-market-becb6 (Firebase Console → Firestore Database → Create database), and that FIREBASE_PROJECT_ID/GOOGLE_APPLICATION_CREDENTIALS match the same project.',
    });
  }
});

app.use('/api/admin', adminAuthRoute);

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Backend] listening on http://localhost:${PORT}`));
