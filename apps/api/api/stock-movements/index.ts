import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'stock_movements',
  schema: entitySchemas.stock_movements,
  readPermission: 'stock:read',
  writePermission: 'stock:write'
});
