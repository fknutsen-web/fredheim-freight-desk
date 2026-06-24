// POST /api/lead  { name, company, email, input:{annualTonnes,shipments,benchmark}, selectedTier }
// Recomputes the quote server-side (never trusts client numbers) and stores the lead.
import { RATES } from '../lib/rates.js';
import { computeTiers } from '../lib/calc.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const input = {
    annualTonnes: +(body?.input?.annualTonnes) || 0,
    shipments: +(body?.input?.shipments) || 1,
    benchmark: +(body?.input?.benchmark) || 0,
    lightContracts: +(body?.input?.lightContracts) || 0,
    structuredContracts: +(body?.input?.structuredContracts) || 0,
  };
  const quote = computeTiers(input, RATES);          // authoritative, server-side
  const record = {
    name: (body?.name || '').slice(0, 200),
    company: (body?.company || '').slice(0, 200),
    email: (body?.email || '').slice(0, 200),
    selected_tier: (body?.selectedTier || quote.bestKey),
    inputs: input,
    quote,
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // No DB configured yet — accept the lead but don't persist (demo mode).
    console.log('LEAD (not persisted — set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY):', record);
    return res.status(200).json({ ok: true, persisted: false });
  }
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase.from('pelorus_leads').insert(record).select('id').single();
    if (error) throw error;
    return res.status(200).json({ ok: true, persisted: true, id: data.id });
  } catch (e) {
    console.error('lead insert failed:', e.message);
    return res.status(200).json({ ok: true, persisted: false, error: 'store_failed' });
  }
}
