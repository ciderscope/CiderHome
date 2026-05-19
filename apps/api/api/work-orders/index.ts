import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'work_orders',
  schema: entitySchemas.work_orders,
  readPermission: 'operation:read',
  writePermission: 'operation:write'
});
