import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertCan, assertCanAccessSite, toCsv } from '@cuverie/shared';
import { getApiContext } from '../../src/lib/context.js';
import { allowMethods, csv, handle, HttpError } from '../../src/lib/http.js';
import { supabaseAdmin } from '../../src/lib/supabase.js';
import { snakeToCamel } from '../../src/persistence/caseMapping.js';

const EXPORTABLE_TABLES = new Set([
  'tanks',
  'lots',
  'harvest_receipts',
  'sub_lot_samples',
  'operations',
  'work_orders',
  'inputs',
  'stock_items',
  'stock_movements',
  'analyses',
  'document_attachments',
  'transfer_orders',
  'traceability_events',
  'alerts',
  'alert_rules',
  'bottling_batches',
  'audit_logs',
  'sensor_readings'
]);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['GET']);
    const { actor } = await getApiContext(req);
    assertCan(actor, 'export:csv');

    const table = req.query.table?.toString();
    const siteId = req.query.siteId?.toString();
    if (!table || !EXPORTABLE_TABLES.has(table)) {
      throw new HttpError(400, 'Table exportable invalide');
    }
    if (siteId) {
      assertCanAccessSite(actor, siteId);
    }

    const maxRows = Number(process.env.CSV_EXPORT_MAX_ROWS ?? 10000);
    let query = supabaseAdmin.from(table).select('*').limit(maxRows);
    if (siteId) {
      query = query.eq('site_id', siteId);
    } else if (actor.role !== 'admin') {
      query = query.in('site_id', actor.siteIds);
    }

    const { data, error } = await query;
    if (error) {
      throw new HttpError(500, error.message);
    }

    const rows = snakeToCamel<Record<string, unknown>[]>(data ?? []);
    const firstRow = rows[0];
    const columns = firstRow ? Object.keys(firstRow).map((key) => ({ key, label: key })) : [];
    csv(res, `${table}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, columns));
  }, res);
}
