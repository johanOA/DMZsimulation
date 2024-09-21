USE userdb;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS public_KEY;
DROP TABLE IF EXISTS private_KEY;

-- Crear tabla public_KEY
CREATE TABLE public_KEY (
    id INT PRIMARY KEY,
    key_value VARCHAR(255) NOT NULL
);

-- Crear tabla private_KEY
CREATE TABLE private_KEY (
    id INT PRIMARY KEY,
    key_value VARCHAR(255) NOT NULL
);

-- Inserciones de prueba para public_KEY
INSERT INTO public_KEY (id, key_value) VALUES 
(1, '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PUBLIC KEY-----'),
(2, '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCB...\n-----END PUBLIC KEY-----'),
(3, '-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKuG...\n-----END PUBLIC KEY-----');

-- Inserciones de prueba para private_KEY
INSERT INTO private_KEY (id, key_value) VALUES 
(1, '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PRIVATE KEY-----'),
(2, '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PRIVATE KEY-----'),
(3, '-----BEGIN PRIVATE KEY-----\nMIIEwgIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PRIVATE KEY-----');

