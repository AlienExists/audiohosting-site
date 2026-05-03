-- -- CREATE TABLE users (
-- --   id          SERIAL PRIMARY KEY,
-- --   username    VARCHAR(50)  UNIQUE NOT NULL,
-- --   email       VARCHAR(255) UNIQUE NOT NULL,
-- --   password    VARCHAR(255) NOT NULL,
-- --   avatar_url  VARCHAR(255),
-- --   created_at  TIMESTAMP DEFAULT NOW()
-- -- );

-- -- CREATE TABLE roles (
-- --     id  SERIAL PRIMARY KEY,
-- --     name VARCHAR(50)

-- -- );

-- -- CREATE TABLE user_roles (
-- --     user_id SERIAL references users(id),
-- --     role_id SERIAL references roles(id)
-- -- );



-- -- INSERT INTO users VALUES (1, 'admin', 'admin', '');

-- -- UPDATE users 
-- -- SET password = 'admin' 
-- -- WHERE id = 1;

-- -- SELECT * FROM users WHERE email='admin';

-- CREATE TABLE genres (
--   id    SERIAL PRIMARY KEY,
--   name  VARCHAR(100) UNIQUE NOT NULL,
--   slug  VARCHAR(100) UNIQUE NOT NULL
-- );

-- CREATE TABLE tracks (
--   id          SERIAL PRIMARY KEY,
--   user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
--   genre_id    INTEGER REFERENCES genres(id),
--   title       VARCHAR(255) NOT NULL,
--   file_url    VARCHAR(255) NOT NULL,
--   cover_url   VARCHAR(255),
--   duration    INTEGER,
--   plays       INTEGER DEFAULT 0,
--   created_at  TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE collections (
--   id          SERIAL PRIMARY KEY,
--   user_id     INTEGER REFERENCES users(id),
--   title       VARCHAR(255) NOT NULL,
--   description TEXT,
--   type        VARCHAR(50) DEFAULT 'user',
--   created_at  TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE collection_tracks (
--   collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
--   track_id      INTEGER REFERENCES tracks(id)      ON DELETE CASCADE,
--   position      INTEGER,
--   PRIMARY KEY (collection_id, track_id)
-- );

-- CREATE TABLE news (
--   id          SERIAL PRIMARY KEY,
--   title       VARCHAR(255) NOT NULL,
--   excerpt     TEXT,
--   content     TEXT,
--   tag         VARCHAR(100),
--   cover_url   VARCHAR(255),
--   created_at  TIMESTAMP DEFAULT NOW()
-- );

-- -- Начальные жанры
-- INSERT INTO genres (name, slug) VALUES
--   ('Электронная', 'electronic'),
--   ('Эмбиент',     'ambient'),
--   ('Lo-fi',       'lo-fi'),
--   ('Джаз',        'jazz'),
--   ('Инди',        'indie'),
--   ('Классика',    'classical'),
--   ('Хип-хоп',     'hip-hop'),
--   ('Поп',         'pop'),
--   ('Рок',         'rock');

-- Добавляем статус треку
ALTER TABLE tracks ADD COLUMN status VARCHAR(20) DEFAULT 'pending';

-- Добавляем роль пользователю  
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Делаем себя админом (подставь свой email)
UPDATE users SET role = 'admin' WHERE email = 'твой@email.com';

-- Существующие треки одобряем
UPDATE tracks SET status = 'approved';