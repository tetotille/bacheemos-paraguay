export const PUBLIC_API_URL =
  import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const PUBLIC_SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://rmfutpwhnbxnozvjcgkd.supabase.co';

export const PUBLIC_SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_CRjwOi9_k1SQlwQfVXTK4A_-couU_p2';

export const PUBLIC_MAP_STYLE_URL =
  import.meta.env.PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

export const PUBLIC_TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '';
