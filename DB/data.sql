USE userdb;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS public_KEY;

-- Crear tabla public_KEY
CREATE TABLE public_KEY (
    id INT PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    key_value VARCHAR(255) NOT NULL
);

-- Inserciones de prueba para public_KEY
INSERT INTO public_KEY (id, alias, key_value) VALUES 
(1, 'johan', '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PUBLIC KEY-----'),
(2, 'julina', '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCB...\n-----END PUBLIC KEY-----'),
(3, 'santiago ', '-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKuG...\n-----END PUBLIC KEY-----');
