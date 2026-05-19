import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'stock_items',
  schema: entitySchemas.stock_items,
  readPermission: 'stock:read',
  writePermission: 'stock:write'
});
