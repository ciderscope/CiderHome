import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'sites',
  schema: entitySchemas.sites,
  readPermission: 'site:read',
  writePermission: 'site:manage',
  siteScoped: false
});

