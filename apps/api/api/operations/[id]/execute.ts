import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Operation } from '@cuverie/shared';
import { executeOperation } from '@cuverie/shared';
import { getApiContext } from '../../../src/lib/context.js';
import { allowMethods, handle, HttpError, json } from '../../../src/lib/http.js';
import { supabaseAdmin } from '../../../src/lib/supabase.js';
import { camelToSnake, snakeToCamel } from '../../../src/persistence/caseMapping.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['POST']);
    const { actor } = await getApiContext(req);
    const id = req.query.id?.toString();
    if (!id) {
      throw new HttpError(400, 'Identifiant manquant');
    }

    const { data: rawOperation, error: readError } = await supabaseAdmin.from('operations').select('*').eq('id', id).single();
    if (readError || !rawOperation) {
      throw new HttpError(404, 'Operation introuvable');
    }

    const result = executeOperation(snakeToCamel<Operation>(rawOperation), actor, new Date().toISOString());
    const writes = [
      supabaseAdmin.from('operations').update(camelToSnake(result.operation)).eq('id', id).select('*').single(),
      supabaseAdmin.from('audit_logs').insert(camelToSnake(result.auditLog))
    ];
    if (result.traceabilityEvent) {
      writes.push(supabaseAdmin.from('traceability_events').insert(camelToSnake(result.traceabilityEvent)));
    }

    const [operationUpdate, ...rest] = await Promise.all(writes);
    if (!operationUpdate) {
      throw new HttpError(500, 'Operation non mise a jour');
    }
    const error = operationUpdate.error ?? rest.find((write) => write.error)?.error ?? undefined;
    if (error) {
      throw new HttpError(500, error.message);
    }

    json(res, 200, {
      data: snakeToCamel(operationUpdate.data),
      auditLog: result.auditLog,
      traceabilityEvent: result.traceabilityEvent
    });
  }, res);
}
