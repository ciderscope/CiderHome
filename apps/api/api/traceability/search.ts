import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TraceabilityDirection, TraceabilityEvent } from '@cuverie/shared';
import { assertCan, assertCanAccessSite, searchTraceability } from '@cuverie/shared';
import { getApiContext } from '../../src/lib/context.js';
import { allowMethods, handle, HttpError, json } from '../../src/lib/http.js';
import { supabaseAdmin } from '../../src/lib/supabase.js';
import { snakeToCamel } from '../../src/persistence/caseMapping.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['GET']);
    const { actor } = await getApiContext(req);
    assertCan(actor, 'traceability:read');

    const siteId = req.query.siteId?.toString();
    const entityType = req.query.entityType?.toString();
    const entityId = req.query.entityId?.toString();
    const direction = req.query.direction?.toString() as TraceabilityDirection | undefined;

    if (!siteId || !entityType || !entityId || !direction) {
      throw new HttpError(400, 'Parametres requis: siteId, entityType, entityId, direction');
    }
    if (!['upstream', 'downstream'].includes(direction)) {
      throw new HttpError(400, 'Direction invalide');
    }

    assertCanAccessSite(actor, siteId);

    const { data, error } = await supabaseAdmin
      .from('traceability_events')
      .select('*')
      .eq('site_id', siteId)
      .order('occurred_at', { ascending: true })
      .limit(1000);

    if (error) {
      throw new HttpError(500, error.message);
    }

    const events = snakeToCamel<TraceabilityEvent[]>(data ?? []);
    json(res, 200, { data: searchTraceability(events, { entityType, entityId }, direction) });
  }, res);
}

