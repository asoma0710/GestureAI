SELECT * FROM appusers;
ALTER TABLE appusers ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
