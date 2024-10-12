USE userdb;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS public_KEY;

-- userdb.users definition

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `user_pass` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- userdb.public_KEY definition

CREATE TABLE `public_KEY` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alias` varchar(255) NOT NULL,
  `key_value` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- userdb.archivos_subidos definition

CREATE TABLE `archivos_subidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(255) NOT NULL,
  `tamano` int NOT NULL,
  `tipo_contenido` varchar(50) NOT NULL,
  `archivo` longblob NOT NULL,
  `hash_archivo` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `llave_usuario_comparte` longtext,
  `es_compartido` tinyint(1) DEFAULT '0',
  `usuario_comparte` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear tabla llaves_usuario
CREATE TABLE llaves_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alias_emisor VARCHAR(255) NOT NULL,           -- Email del emisor
  alias_receptor VARCHAR(255) NOT NULL,         -- Email del receptor
  llave_publica VARCHAR(255) NOT NULL
);

-- userdb.archivos_firmados definition

CREATE TABLE `archivos_firmados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alias` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `signature` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Inserciones de prueba para public_KEY
INSERT INTO public_KEY (id, alias, key_value) VALUES 
(1, '106150899574720315928', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8u0tRtDvInIbI6Az8v5WO/+fVihgNypka+Q3Xkl8nkBQowjXiHpOT+vGGbGa+YUs1Tftgni6PP8Sy2NPePE4gWEF8EDNAuyBvMJHO2Q6iiHZ1Yp/zJnpy15JWcuEWl59Xd1wQHdhmI26IpzInFvRmuCI6rfIF2aL7VjgMlbg/0z/kviLySjJzO5mlGppmLllk4JSyCwjuC4fb+y43cGOyZGORnFyiUhmleRP9tEHrsv0VXDX6hBWPIbp6XmlLJEWEF5O3Dp4VqNS5dk+zU+JUINxG08bY8Ak2WyvRkmCaHnz8yll2Cz6r2DUpgUaHfJxohRWgrMLX/DAeoUP3tyBLQIDAQAB'),
(2, '114250841819003769742', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8PRVMSVN7Xlv/4Mfem9k+cw6dT6TTTiMzHwNp+b/wX9enETs4GzaMcQrBcJtaPD3qdtL5SnEkH8OMPYcZ6gDVMFv6m9u5lpkdIU7TRJp/mHNByZt8wUJMZPfG9JTBheEmDeKewfHLnsZcT/RrCmd2SsyqqtuNY7DbbFS6NgAlHBMRW1E5X+40MBhQQDRZJC2ycC4qBEJJX8AlYZAdT+UbLdnVfegOXhiERK5QC1ibGN+3bho9CdCx9ZoH5ZjgQr9D0xRp31qFCnM3Pu3QP6FkionqXpK7pRMpCL19LJxK/2fk7zzXchAvRvfjmXX7Uh0q1aamsXPc3EPIF0O10tUJwIDAQAB');
