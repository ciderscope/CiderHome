import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Permission } from '@cuverie/shared';
import { assertCan, assertCanAccessSite, validateWithSchema } from '@cuverie/shared';
import { getApiContext } from './context.js';
import { allowMethods, handle, HttpError, json } from './http.js';
import { supabaseAdmin } from './supabase.js';
import { camelToSnake, snakeToCamel } from '../persistence/caseMapping.js';

export interface EntityRouteConfig {
  table: string;
  schema: object;
  readPermission: Permission;
  writePermission: Permission;
  siteScoped?: boolean;
}

export function createCollectionRoute(config: EntityRouteConfig) {
  return async function collectionRoute(req: VercelRequest, res: VercelResponse): Promise<void> {
    await handle(async () => {
      allowMethods(req, ['GET', 'POST']);
      const { actor } = await getApiContext(req);

      if (req.method === 'GET') {
        assertCan(actor, config.readPermission);
        const siteId = req.query.siteId?.toString();
        const siteScoped = config.siteScoped ?? true;
        if (siteId && siteScoped) {
          assertCanAccessSite(actor, siteId);
        }

        let query = supabaseAdmin.from(config.table).select('*').order('created_at', { ascending: false }).limit(250);
        if (siteId && siteScoped) {
          query = query.eq('site_id', siteId);
        } else if (siteScoped && actor.role !== 'admin') {
          query = query.in('site_id', actor.siteIds);
        }

        const { data, error } = await query;
        if (error) {
          throw new HttpError(500, error.message);
        }

        json(res, 200, { data: snakeToCamel(data ?? []) });
        return;
      }

      assertCan(actor, config.writePermission);
      const validation = validateWithSchema<Record<string, unknown>>(config.schema, req.body);
      if (!validation.valid || !validation.data) {
        throw new HttpError(400, 'Payload invalide', validation.errors);
      }

      const siteId = validation.data.siteId?.toString();
      if (siteId && (config.siteScoped ?? true)) {
        assertCanAccessSite(actor, siteId);
      }

      const { data, error } = await supabaseAdmin.from(config.table).insert(camelToSnake(validation.data)).select('*').single();
      if (error) {
        throw new HttpError(500, error.message);
      }

      json(res, 201, { data: snakeToCamel(data) });
    }, res);
  };
}

export function createItemRoute(config: EntityRouteConfig) {
  return async function itemRoute(req: VercelRequest, res: VercelResponse): Promise<void> {
    await handle(async () => {
      allowMethods(req, ['GET', 'PATCH', 'DELETE']);
      const { actor } = await getApiContext(req);
      const id = req.query.id?.toString();
      if (!id) {
        throw new HttpError(400, 'Identifiant manquant');
      }

      if (req.method === 'GET') {
        assertCan(actor, config.readPermission);
      } else {
        assertCan(actor, config.writePermission);
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from(config.table)
        .select('*')
        .eq('id', id)
        .single();

      if (existingError || !existing) {
        throw new HttpError(404, 'Entite introuvable');
      }

      if (existing.site_id) {
        assertCanAccessSite(actor, existing.site_id);
      }

      if (req.method === 'GET') {
        json(res, 200, { data: snakeToCamel(existing) });
        return;
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseAdmin.from(config.table).delete().eq('id', id);
        if (error) {
          throw new HttpError(500, error.message);
        }
        json(res, 204, null);
        return;
      }

      const payload = camelToSnake(req.body as Record<string, unknown>);
      const { data, error } = await supabaseAdmin.from(config.table).update(payload).eq('id', id).select('*').single();
      if (error) {
        throw new HttpError(500, error.message);
      }

      json(res, 200, { data: snakeToCamel(data) });
    }, res);
  };
}
