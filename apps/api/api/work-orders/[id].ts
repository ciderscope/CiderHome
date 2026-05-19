import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'work_orders',
  schema: entitySchemas.work_orders,
  readPermission: 'operation:read',
  writePermission: 'operation:write'
});
