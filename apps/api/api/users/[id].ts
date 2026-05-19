import { createItemRoute } from '../../src/lib/entityRoute.js';
import { entitySchemas } from '../../src/schemas.js';

export default createItemRoute({
  table: 'user_profiles',
  schema: entitySchemas.user_profiles,
  readPermission: 'user:manage',
  writePermission: 'user:manage',
  siteScoped: false
});
