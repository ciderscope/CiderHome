import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Tank, TransferOrder } from '@cuverie/shared';
import { executeTransferOrder } from '@cuverie/shared';
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

    const { data: rawOrder, error: orderError } = await supabaseAdmin.from('transfer_orders').select('*').eq('id', id).single();
    if (orderError || !rawOrder) {
      throw new HttpError(404, 'Ordre de transfert introuvable');
    }

    const order = snakeToCamel<TransferOrder>(rawOrder);
    const [{ data: rawSource, error: sourceError }, { data: rawTarget, error: targetError }] = await Promise.all([
      supabaseAdmin.from('tanks').select('*').eq('id', order.sourceTankId).single(),
      supabaseAdmin.from('tanks').select('*').eq('id', order.targetTankId).single()
    ]);

    if (sourceError || !rawSource || targetError || !rawTarget) {
      throw new HttpError(404, 'Cuve source ou cible introuvable');
    }

    const result = executeTransferOrder(
      order,
      snakeToCamel<Tank>(rawSource),
      snakeToCamel<Tank>(rawTarget),
      actor,
      new Date().toISOString()
    );

    const [orderUpdate, sourceUpdate, targetUpdate, traceInsert, auditInsert] = await Promise.all([
      supabaseAdmin.from('transfer_orders').update(camelToSnake(result.order)).eq('id', result.order.id).select('*').single(),
      supabaseAdmin.from('tanks').update(camelToSnake(result.sourceTank)).eq('id', result.sourceTank.id).select('*').single(),
      supabaseAdmin.from('tanks').update(camelToSnake(result.targetTank)).eq('id', result.targetTank.id).select('*').single(),
      supabaseAdmin.from('traceability_events').insert(result.traceabilityEvents.map(camelToSnake)),
      supabaseAdmin.from('audit_logs').insert(camelToSnake(result.auditLog))
    ]);

    const error =
      orderUpdate.error ?? sourceUpdate.error ?? targetUpdate.error ?? traceInsert.error ?? auditInsert.error ?? undefined;
    if (error) {
      throw new HttpError(500, error.message);
    }

    json(res, 200, {
      data: {
        order: snakeToCamel(orderUpdate.data),
        sourceTank: snakeToCamel(sourceUpdate.data),
        targetTank: snakeToCamel(targetUpdate.data),
        traceabilityEvents: result.traceabilityEvents,
        auditLog: result.auditLog
      }
    });
  }, res);
}

