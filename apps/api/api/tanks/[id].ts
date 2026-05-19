import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'tanks',
  schema: entitySchemas.tanks,
  readPermission: 'tank:read',
  writePermission: 'tank:write'
});

