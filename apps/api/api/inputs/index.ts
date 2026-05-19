import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'inputs',
  schema: entitySchemas.inputs,
  readPermission: 'operation:read',
  writePermission: 'operation:write'
});

