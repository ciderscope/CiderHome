import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AlertRule, SensorReading, Tank } from '@cuverie/shared';
import { assertCan, evaluateAlertRules, evaluateSensorReading, validateWithSchema } from '@cuverie/shared';
import { getApiContext, getSensorSecret } from '../../src/lib/context.js';
import { allowMethods, handle, HttpError, json } from '../../src/lib/http.js';
import { supabaseAdmin } from '../../src/lib/supabase.js';
import { entitySchemas } from '../../src/schemas.js';
import { camelToSnake, snakeToCamel } from '../../src/persistence/caseMapping.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handle(async () => {
    allowMethods(req, ['POST']);

    const configuredSecret = process.env.SENSOR_INGESTION_SECRET;
    const providedSecret = getSensorSecret(req);
    if (configuredSecret && providedSecret !== configuredSecret) {
      const { actor } = await getApiContext(req);
      assertCan(actor, 'sensor:ingest');
    }

    const validation = validateWithSchema<SensorReading>(entitySchemas.sensor_readings, req.body);
    if (!validation.valid || !validation.data) {
      throw new HttpError(400, 'Lecture capteur invalide', validation.errors);
    }

    const [{ data: rawTank }, { data: rawRules }] = await Promise.all([
      supabaseAdmin.from('tanks').select('*').eq('id', validation.data.tankId).single(),
      supabaseAdmin.from('alert_rules').select('*').eq('site_id', validation.data.siteId).eq('scope', 'tank').eq('enabled', true)
    ]);
    const alerts = evaluateSensorReading(validation.data, rawTank ? snakeToCamel<Tank>(rawTank) : undefined);
    const ruleAlerts = evaluateAlertRules(snakeToCamel<AlertRule[]>(rawRules ?? []), {
      siteId: validation.data.siteId,
      entityType: 'tank',
      entityId: validation.data.tankId,
      metrics: validation.data.metrics,
      measuredAt: validation.data.measuredAt
    });

    const { data, error } = await supabaseAdmin
      .from('sensor_readings')
      .insert(camelToSnake(validation.data))
      .select('*')
      .single();

    if (error) {
      throw new HttpError(500, error.message);
    }

    if (ruleAlerts.length > 0) {
      const { error: alertError } = await supabaseAdmin.from('alerts').upsert(ruleAlerts.map(camelToSnake), { onConflict: 'id' });
      if (alertError) {
        throw new HttpError(500, alertError.message);
      }
    }

    json(res, 202, { data: snakeToCamel(data), alerts, ruleAlerts });
  }, res);
}
