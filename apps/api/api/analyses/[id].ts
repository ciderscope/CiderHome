import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'analyses',
  schema: entitySchemas.analyses,
  readPermission: 'analysis:read',
  writePermission: 'analysis:write'
});

