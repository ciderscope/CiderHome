import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'bottling_batches',
  schema: entitySchemas.bottling_batches,
  readPermission: 'report:read',
  writePermission: 'operation:write'
});
