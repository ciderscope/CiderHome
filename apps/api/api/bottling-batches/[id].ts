import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'bottling_batches',
  schema: entitySchemas.bottling_batches,
  readPermission: 'report:read',
  writePermission: 'operation:write'
});
