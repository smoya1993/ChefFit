-- PostgreSQL schema for Recipen/Cheffit backend
-- This script is idempotent (safe to run multiple times).

BEGIN;

-- Optional: enables gen_random_uuid() if you want to insert UUIDs from SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  profile_picture text NOT NULL DEFAULT '',
  favorites uuid[] NOT NULL DEFAULT '{}',
  roles text[] NOT NULL DEFAULT ARRAY['BasicUser'],
  is_disabled boolean NOT NULL DEFAULT false,
  refresh_token text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY,
  title text,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  description text,
  image text,
  cooking_time text,
  calories text,
  ingredients text[] NOT NULL DEFAULT '{}',
  instructions text[] NOT NULL DEFAULT '{}',
  ratings jsonb NOT NULL DEFAULT '[]'::jsonb,
  comments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY,
  title text,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  description text,
  image text,
  ratings jsonb NOT NULL DEFAULT '[]'::jsonb,
  comments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_author_id ON recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);

COMMIT;


