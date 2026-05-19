import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'alert_rules',
  schema: entitySchemas.alert_rules,
  readPermission: 'alert:read',
  writePermission: 'alert:manage'
});
