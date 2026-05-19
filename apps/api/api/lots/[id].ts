import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'lots',
  schema: entitySchemas.lots,
  readPermission: 'lot:read',
  writePermission: 'lot:write'
});

