import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TransferOrder } from '@cuverie/shared';
import { approveTransferOrder } from '@cuverie/shared';
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

    const { data: rawOrder, error: readError } = await supabaseAdmin.from('transfer_orders').select('*').eq('id', id).single();
    if (readError || !rawOrder) {
      throw new HttpError(404, 'Ordre de transfert introuvable');
    }

    const approved = approveTransferOrder(snakeToCamel<TransferOrder>(rawOrder), actor, new Date().toISOString());
    const { data, error } = await supabaseAdmin
      .from('transfer_orders')
      .update(camelToSnake(approved))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new HttpError(500, error.message);
    }

    json(res, 200, { data: snakeToCamel(data) });
  }, res);
}

