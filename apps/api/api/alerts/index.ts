import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'alerts',
  schema: entitySchemas.alerts,
  readPermission: 'alert:read',
  writePermission: 'alert:manage'
});
