import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'alert_rules',
  schema: entitySchemas.alert_rules,
  readPermission: 'alert:read',
  writePermission: 'alert:manage'
});
