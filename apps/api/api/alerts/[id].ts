import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'alerts',
  schema: entitySchemas.alerts,
  readPermission: 'alert:read',
  writePermission: 'alert:manage'
});
