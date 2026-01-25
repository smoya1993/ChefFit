-- Seed user for PostgreSQL (Recipen/Cheffit backend)
-- IMPORTANT: password must be a bcrypt hash (NOT plaintext).
-- Requires pgcrypto if you want to use gen_random_uuid():
--   CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Generate bcrypt hash (run from server/):
--    PowerShell:
--      node -e "const bcrypt=require('bcrypt'); bcrypt.hash('P@ssw0rd!',10).then(h=>console.log(h))"
--
-- 2) Paste the resulting hash into the INSERT below:

INSERT INTO users (
  id,
  name,
  email,
  password,
  profile_picture,
  favorites,
  roles,
  is_disabled,
  refresh_token
)
VALUES (
  gen_random_uuid(),
  'Sergio',
  'smoya1993@hotmail.com',
  '<PASTE_BCRYPT_HASH_HERE>',
  '',
  '{}',
  ARRAY['BasicUser','ProUser','Admin'],
  false,
  ''
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  roles = EXCLUDED.roles,
  updated_at = now();


