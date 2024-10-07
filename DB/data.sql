USE userdb;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS public_KEY;

-- Crear tabla users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  user_pass VARCHAR(255)
);

-- Crear tabla public_KEY
CREATE TABLE public_KEY (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    key_value LONGTEXT NOT NULL
);

-- Crear tabla archivos_subidos
CREATE TABLE archivos_subidos (
    id INT AUTO_INCREMENT PRIMARY KEY,           -- ID único del archivo
    alias VARCHAR(255) NOT NULL,                 -- Email del usuario que sube el archivo
    llave_usuario_comparte VARCHAR(255),         -- Llave del usuario que comparte
    nombre_archivo VARCHAR(255) NOT NULL,        -- Nombre del archivo
    tamano INT NOT NULL,                         -- Tamaño del archivo en bytes
    tipo_contenido VARCHAR(50) NOT NULL,         -- Tipo MIME del archivo (por ejemplo, 'application/pdf')
    archivo LONGBLOB NOT NULL,                   -- Contenido del archivo almacenado como un BLOB
    hash_archivo VARCHAR(255) NOT NULL,          -- Hash del archivo (usar 64 caracteres para SHA-256)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación del registro
    es_compartido TINYINT(1) DEFAULT 0  -- Campo booleano, por defecto FALSE
);

-- Crear tabla llaves_usuario
CREATE TABLE llaves_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alias_emisor VARCHAR(255) NOT NULL,           -- Email del emisor
  alias_receptor VARCHAR(255) NOT NULL,         -- Email del receptor
  llave_publica VARCHAR(255) NOT NULL
);

-- Crear tabla archivos_firmados
CREATE TABLE archivos_firmados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alias VARCHAR(255) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL, 
  signature TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserciones de prueba para public_KEY
INSERT INTO public_KEY (id, alias, key_value) VALUES 
(1, '106150899574720315928', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8u0tRtDvInIbI6Az8v5WO/+fVihgNypka+Q3Xkl8nkBQowjXiHpOT+vGGbGa+YUs1Tftgni6PP8Sy2NPePE4gWEF8EDNAuyBvMJHO2Q6iiHZ1Yp/zJnpy15JWcuEWl59Xd1wQHdhmI26IpzInFvRmuCI6rfIF2aL7VjgMlbg/0z/kviLySjJzO5mlGppmLllk4JSyCwjuC4fb+y43cGOyZGORnFyiUhmleRP9tEHrsv0VXDX6hBWPIbp6XmlLJEWEF5O3Dp4VqNS5dk+zU+JUINxG08bY8Ak2WyvRkmCaHnz8yll2Cz6r2DUpgUaHfJxohRWgrMLX/DAeoUP3tyBLQIDAQAB'),
(2, '114250841819003769742', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8PRVMSVN7Xlv/4Mfem9k+cw6dT6TTTiMzHwNp+b/wX9enETs4GzaMcQrBcJtaPD3qdtL5SnEkH8OMPYcZ6gDVMFv6m9u5lpkdIU7TRJp/mHNByZt8wUJMZPfG9JTBheEmDeKewfHLnsZcT/RrCmd2SsyqqtuNY7DbbFS6NgAlHBMRW1E5X+40MBhQQDRZJC2ycC4qBEJJX8AlYZAdT+UbLdnVfegOXhiERK5QC1ibGN+3bho9CdCx9ZoH5ZjgQr9D0xRp31qFCnM3Pu3QP6FkionqXpK7pRMpCL19LJxK/2fk7zzXchAvRvfjmXX7Uh0q1aamsXPc3EPIF0O10tUJwIDAQAB');
