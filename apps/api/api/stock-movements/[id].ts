import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'stock_movements',
  schema: entitySchemas.stock_movements,
  readPermission: 'stock:read',
  writePermission: 'stock:write'
});
