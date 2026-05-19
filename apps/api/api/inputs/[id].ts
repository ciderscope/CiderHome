import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'inputs',
  schema: entitySchemas.inputs,
  readPermission: 'operation:read',
  writePermission: 'operation:write'
});

