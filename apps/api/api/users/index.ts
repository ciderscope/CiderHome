import { createCollectionRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createCollectionRoute({
  table: 'user_profiles',
  schema: entitySchemas.user_profiles,
  readPermission: 'user:manage',
  writePermission: 'user:manage',
  siteScoped: false
});

