import type { VercelRequest } from '@vercel/node';
import type { AuthenticatedActor } from '@cuverie/shared';
import { supabaseAdmin } from './supabase.js';
import { HttpError } from './http.js';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: AuthenticatedActor['role'];
  site_ids: string[];
  active: boolean;
}

export interface ApiContext {
  actor: AuthenticatedActor;
}

export async function getApiContext(req: VercelRequest): Promise<ApiContext> {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : undefined;

  if (!token) {
    throw new HttpError(401, 'Authentification requise');
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    throw new HttpError(401, 'Session invalide');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('id,email,full_name,role,site_ids,active')
    .eq('id', userData.user.id)
    .single<ProfileRow>();

  if (profileError || !profile || !profile.active) {
    throw new HttpError(403, 'Profil inactif ou introuvable');
  }

  return {
    actor: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      siteIds: profile.site_ids
    }
  };
}

export function getSensorSecret(req: VercelRequest): string | undefined {
  const header = req.headers['x-ingestion-secret'];
  return Array.isArray(header) ? header[0] : header;
}

