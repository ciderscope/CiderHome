import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TraceabilityDirection, TraceabilityEvent } from '@cuverie/shared';
import { assertCan, searchTraceability } from '@cuverie/shared';
import { getApiContext } from '../../src/lib/context.js';
import { allowMethods, handle, HttpError, json } from '../../src/lib/http.js';
import { supabaseAdmin } from '../../src/lib/supabase.js';
import { snakeToCamel } from '../../src/persistence/caseMapping.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['GET']);
    const { actor } = await getApiContext(req);
    assertCan(actor, 'report:read');

    const siteId = req.query.siteId?.toString();
    const entityType = req.query.entityType?.toString() ?? 'lot';
    const entityId = req.query.entityId?.toString();
    const direction = (req.query.direction?.toString() ?? 'downstream') as TraceabilityDirection;
    if (!siteId || !entityId) {
      throw new HttpError(400, 'siteId et entityId sont requis');
    }

    let query = supabaseAdmin.from('traceability_events').select('*').eq('site_id', siteId).order('occurred_at', { ascending: true });
    if (actor.role !== 'admin') {
      query = query.in('site_id', actor.siteIds);
    }

    const { data, error } = await query;
    if (error) {
      throw new HttpError(500, error.message);
    }

    const events = snakeToCamel<TraceabilityEvent[]>(data ?? []);
    const graph = searchTraceability(events, { entityType, entityId }, direction);
    json(res, 200, {
      data: {
        siteId,
        entityType,
        entityId,
        direction,
        graph,
        eventCount: graph.edges.length
      }
    });
  }, res);
}
