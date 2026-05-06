-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  color      VARCHAR(7)   NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Rooms (channels)
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  slug        VARCHAR(100) NOT NULL UNIQUE,
  is_private  BOOLEAN      NOT NULL DEFAULT FALSE,
  owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Room members
CREATE TABLE IF NOT EXISTS room_members (
  room_id    UUID        NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL DEFAULT 'member',   -- owner | admin | member
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID        NOT NULL REFERENCES rooms(id)    ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  type       VARCHAR(20) NOT NULL DEFAULT 'text',          -- text | system | file
  edited     BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted    BOOLEAN     NOT NULL DEFAULT FALSE,
  reply_to   UUID        REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id     ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_slug           ON rooms(slug);

-- Seed: default public rooms
INSERT INTO users (id, username, email, password, color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'system@collab.app', 'n/a', '#6b7280')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (id, name, description, slug, owner_id) VALUES
  ('00000000-0000-0000-0000-000000000010', 'General',     'General discussion',   'general',     '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000011', 'Random',      'Random chat',          'random',      '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', 'Development', 'Dev team discussions', 'development', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;