import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { validateConsultationInput } from './src/utils/validation.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const CONSULTATIONS_FILE = path.resolve(DATA_DIR, 'consultations.json');

interface StoredConsultation {
  referenceId: string;
  submittedAt: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  productCategory: string;
  location: string;
  message: string;
  webhookDispatched: boolean;
}

function isSafeWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '169.254.169.254' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function persistConsultation(entry: StoredConsultation): Promise<void> {
  // Path confinement check
  if (!CONSULTATIONS_FILE.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid persistence path');
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  let existing: StoredConsultation[] = [];
  try {
    const raw = await fs.readFile(CONSULTATIONS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed;
    }
  } catch {
    existing = [];
  }
  existing.push(entry);
  await fs.writeFile(CONSULTATIONS_FILE, JSON.stringify(existing, null, 2), 'utf8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ld-intertech-vending' });
  });

  app.post('/api/consultation', async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const result = validateConsultationInput(body);

    if (!result.valid) {
      res.status(400).json({
        ok: false,
        error: 'Please review the highlighted fields before submitting.',
        errors: result.errors,
      });
      return;
    }

    const referenceId = `LDI-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const submittedAt = new Date().toISOString();
    let webhookDispatched = false;

    const webhookUrl = process.env.CONSULTATION_WEBHOOK_URL?.trim() || '';
    if (webhookUrl && isSafeWebhookUrl(webhookUrl)) {
      try {
        const hookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId,
            submittedAt,
            ...result.sanitized,
          }),
          signal: AbortSignal.timeout(5000),
        });
        webhookDispatched = hookRes.ok;
      } catch {
        webhookDispatched = false;
      }
    }

    const record: StoredConsultation = {
      referenceId,
      submittedAt,
      ...result.sanitized,
      webhookDispatched,
    };

    try {
      await persistConsultation(record);
      res.status(201).json({
        ok: true,
        referenceId,
        submittedAt,
        productCategory: record.productCategory,
        webhookDispatched,
      });
    } catch {
      res.status(500).json({
        ok: false,
        error: 'Unable to record your inquiry right now. Please contact info@ldintertech.com directly.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LD Intertech server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
