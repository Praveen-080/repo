import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoute from './routes/health.js';
import adminAuthRoute from './routes/adminAuth.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ message: 'Fish Market Backend', minimal: true }));
app.use('/health', healthRoute);
app.use('/api/admin', adminAuthRoute);

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Backend] listening on http://localhost:${PORT}`));
