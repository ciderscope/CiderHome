import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'analyses',
  schema: entitySchemas.analyses,
  readPermission: 'analysis:read',
  writePermission: 'analysis:write'
});

