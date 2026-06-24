// POST /api/quote  { annualTonnes, shipments, benchmark }
// Computes the quote server-side. The rate card never leaves the server.
import { RATES } from '../lib/rates.js';
import { computeTiers } from '../lib/calc.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const input = {
    annualTonnes: +(body?.annualTonnes) || 0,
    shipments: +(body?.shipments) || 1,
    benchmark: +(body?.benchmark) || 0,
    lightContracts: +(body?.lightContracts) || 0,
    structuredContracts: +(body?.structuredContracts) || 0,
  };
  if (input.annualTonnes <= 0) return res.status(400).json({ error: 'annualTonnes required' });

  return res.status(200).json(computeTiers(input, RATES));
}
