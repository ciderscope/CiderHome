import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getApiContext } from '../../src/lib/context.js';
import { allowMethods, handle, json } from '../../src/lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['GET']);
    const context = await getApiContext(req);
    json(res, 200, { data: context.actor });
  }, res);
}

