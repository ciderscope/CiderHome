import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'sub_lot_samples',
  schema: entitySchemas.sub_lot_samples,
  readPermission: 'lot:read',
  writePermission: 'lot:write'
});

