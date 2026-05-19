import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'harvest_receipts',
  schema: entitySchemas.harvest_receipts,
  readPermission: 'harvest:read',
  writePermission: 'harvest:write'
});
