import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'transfer_orders',
  schema: entitySchemas.transfer_orders,
  readPermission: 'transfer:read',
  writePermission: 'transfer:create'
});

