import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'document_attachments',
  schema: entitySchemas.document_attachments,
  readPermission: 'document:read',
  writePermission: 'document:write'
});
