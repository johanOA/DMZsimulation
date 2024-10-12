import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";

const mysql = require("mysql2");
import multer from "multer"; // Importamos multer
import crypto from "crypto";
import bcrypt from "bcryptjs"; // Para cifrar contraseñas
import jwt from "jsonwebtoken"; // Para generar y verificar tokens
import dotenv from "dotenv";

declare global {
  namespace Express {
    interface Request {
      user?: any; // o el tipo que desees usar para `user`
    }
  }
}

// Middleware para las solicitudes
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(401).send("No se proporcionó token"); // Unauthorized
  }

  const decodedHeader = jwt.decode(token, { complete: true })?.header;
  if (!decodedHeader || decodedHeader.alg === 'none') {
    return res.status(403).send("Token con algoritmo inválido o no firmado"); // Forbidden
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3 || !tokenParts[2]) {
    return res.status(400).send("Token malformado o sin firma"); // Token inválido
  }

  jwt.verify(token, process.env.JWT_SECRET!,{ algorithms: ["HS256"] }, (err: any, user: any) => {
    if (err) {
      return res.status(403).send("Token inválido"); // Forbidden
    }
    req.user = user; // Almacenar información del usuario en la solicitud
    next();
  });
};

dotenv.config(); // Cargar las variables de entorno

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de CORS
const corsOptions: CorsOptions = {
  origin: "http://localhost:5173", // Permite solo solicitudes desde localhost:5173
  methods: ["GET", "POST"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Usa el middleware de CORS con las opciones especificadas
app.use(cors(corsOptions));

// Middleware para manejar JSON
app.use(express.json());

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage(); // Almacenamos el archivo en memoria
const upload = multer({ storage: storage }); // Configuración del middleware

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "usermy",
  password: "usermy",
  database: "userdb",
  port: 13306,
});

declare global {
  namespace Express {
    interface Request {
      file?: multer.File; // Añade esta propiedad para manejar el archivo
    }
  }
}

// Conexión a MySQL
db.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err.stack);
    return;
  }
  console.log("Conectado a MySQL con ID:", db.threadId);
});

// Ruta de ejemplo
app.get("/", (req: Request, res: Response) => {
  res.send("¡Hola desde Express con TypeScript!");
});

app.post("/api/register", async (req: Request, res: Response) => {
  const { email, user, pass } = req.body;

  if (pass) {
    // Insertar el usuario en la base de datos
    const query = `INSERT INTO users (username, user_pass) VALUES (?, ?)`;
    db.query(query, [user, pass], (err: any) => {
      if (err) {
        return res.status(500).send("Error al registrar el usuario.");
      }
      res.status(201).send("Usuario registrado exitosamente.");
    });
  } else {
    // Insertar el usuario en la base de datos
    const query = `INSERT INTO users (username) VALUES (?)`;
    db.query(query, [email], (err: any) => {
      if (err) {
        return res.status(500).send("Error al registrar el usuario.");
      }
      res.status(201).send("Usuario registrado exitosamente.");
    });
  }
});

app.post("/api/login", (req: Request, res: Response) => {
  const { email, user, pass } = req.body;

  // Buscar el usuario en la base de datos

  if (email) {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [email], async (err: any, results: any) => {
      if (err || results.length === 0) {
        return res.status(401).send("Usuario o contraseña incorrectos.");
      }

      const user = results[0];

      // Generar el access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" , algorithm:"HS256"
        } // El access token expira en 15 minutos
      );

      // Generar el refresh token
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d",algorithm:"HS256" } // El refresh token expira en 7 días
      );

      // Almacenar el refresh token (base de datos o en memoria según sea necesario)

      res.status(200).json({
        accessToken,
        refreshToken,
      });
    });
  } else {
    const query = `SELECT * FROM users WHERE username = ? AND user_pass = ?`;
    db.query(query, [user, pass], async (err: any, results: any) => {
      if (err || results.length === 0) {
        return res.status(401).send("Usuario o contraseña incorrectos.");
      }

      const user = results[0];

      // Generar el access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" } // El access token expira en 15 minutos
      );

      // Generar el refresh token
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" } // El refresh token expira en 7 días
      );

      // Almacenar el refresh token (base de datos o en memoria según sea necesario)

      res.status(200).json({
        accessToken,
        refreshToken,
      });
    });
  }
});

// Ruta para almacenar la llave pública en la base de datos
app.post("/api/storePublicKey", (req: Request, res: Response) => {
  const { publicKey, alias } = req.body;

  // Primero, verifica si ya existe una llave pública asociada al alias
  const checkQuery = `SELECT * FROM public_KEY WHERE alias = ?`;
  db.query(checkQuery, [alias], (err: any, result: any) => {
    if (err) {
      console.error("Error al verificar el alias:", err);
      return res.status(500).send("Error al verificar el alias.");
    }

    if (result.length > 0) {
      // Si ya existe una llave asociada al alias, actualiza la llave pública
      const updateQuery = `UPDATE public_KEY SET key_value = ? WHERE alias = ?`;
      db.query(updateQuery, [publicKey, alias], (updateErr: any) => {
        if (updateErr) {
          console.error("Error al actualizar la llave pública:", updateErr);
          return res.status(500).send("Error al actualizar la llave pública.");
        }
        res.status(200).send("Llave pública actualizada exitosamente.");
      });
    } else {
      // Si no existe, inserta una nueva llave pública
      const insertQuery = `INSERT INTO public_KEY (alias, key_value) VALUES (?, ?)`;
      db.query(insertQuery, [alias, publicKey], (insertErr: any) => {
        if (insertErr) {
          console.error("Error al almacenar la llave pública:", insertErr);
          return res.status(500).send("Error al almacenar la llave pública.");
        }
        res.status(200).send("Llave pública almacenada exitosamente.");
      });
    }
  });
});

// Ruta para recibir archivo y metadatos
app.post(
  "/api/upload",
  upload.single("archivo"),
  (req: Request, res: Response) => {
    const { nombre_archivo, tamano, tipo_contenido, hash_archivo, alias } =
      req.body; // Extraemos los metadatos del archivo, incluyendo el hash
    const fileBuffer = req.file?.buffer; // Obtenemos el buffer del archivo desde req.file

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).send("No se ha enviado ningún archivo.");
    }

    // Consulta SQL para insertar el archivo y sus metadatos en la base de datos, incluyendo el hash
    const query = `
    INSERT INTO archivos_subidos (nombre_archivo, tamano, tipo_contenido, archivo, hash_archivo, alias) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.query(
      query,
      [nombre_archivo, tamano, tipo_contenido, fileBuffer, hash_archivo, alias],
      (err: any, result: any) => {
        if (err) {
          console.error("Error al almacenar el archivo:", err);
          return res.status(500).send("Error al almacenar el archivo.");
        }

        res.status(200).json({
          message: "Archivo almacenado exitosamente",
          fileId: result.insertId, // Retornamos el ID del archivo insertado
        });
      }
    );
  }
);

app.post(
  "/api/share",
  upload.single("archivo"),
  (req: Request, res: Response) => {
    const {
      nombre_archivo,
      tamano,
      tipo_contenido,
      hash_archivo,
      alias,
      usuario_comparte,
      llave_usuario_comparte,
    } = req.body; // Extraemos los metadatos del archivo, incluyendo el hash
    const fileBuffer = req.file?.buffer; // Obtenemos el buffer del archivo desde req.file
    const es_compartido = 1;

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).send("No se ha enviado ningún archivo.");
    }

    if (llave_usuario_comparte) {
      // Consulta SQL para insertar el archivo y sus metadatos en la base de datos, incluyendo el hash
      const query = `
 INSERT INTO archivos_subidos (nombre_archivo, tamano, tipo_contenido, archivo, hash_archivo, alias, usuario_comparte, es_compartido, llave_usuario_comparte) 
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

      db.query(
        query,
        [
          nombre_archivo,
          tamano,
          tipo_contenido,
          fileBuffer,
          hash_archivo,
          alias,
          usuario_comparte,
          es_compartido,
          llave_usuario_comparte,
        ],
        (err: any, result: any) => {
          if (err) {
            console.error("Error al compartir el archivo:", err);
            return res.status(500).send("Error al almacenar el archivo.");
          }

          res.status(200).json({
            message: "Archivo compartido exitosamente",
            fileId: result.insertId, // Retornamos el ID del archivo insertado
          });
        }
      );
    } else {
      // Consulta SQL para insertar el archivo y sus metadatos en la base de datos, incluyendo el hash
      const query = `
     INSERT INTO archivos_subidos (nombre_archivo, tamano, tipo_contenido, archivo, hash_archivo, alias, usuario_comparte, es_compartido) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
   `;

      db.query(
        query,
        [
          nombre_archivo,
          tamano,
          tipo_contenido,
          fileBuffer,
          hash_archivo,
          alias,
          usuario_comparte,
          es_compartido,
        ],
        (err: any, result: any) => {
          if (err) {
            console.error("Error al compartir el archivo:", err);
            return res.status(500).send("Error al almacenar el archivo.");
          }

          res.status(200).json({
            message: "Archivo compartido exitosamente",
            fileId: result.insertId, // Retornamos el ID del archivo insertado
          });
        }
      );
    }
  }
);

// Obtener usuarios
app.get("/api/users", (req: Request, res: Response) => {
  // Consulta SQL para obtener los usuarios
  const query = `SELECT username FROM users`;

  // Ejecutamos la consulta a la base de datos
  db.query(query, (err: any, results: any) => {
    if (err) {
      console.error("Error al obtener los usuarios:", err);
      return res.status(500).send("Error al obtener los usuarios.");
    }

    // Mapeamos los resultados para estructurarlos si es necesario
    const usuarios = results.map((usuario: any) => {
      return {
        username: usuario.username,
      };
    });

    // Respondemos con el array de usuarios en formato JSON
    res.status(200).json({
      message: "Usuarios obtenidos exitosamente",
      usuarios, // Devolvemos los usuarios en el cuerpo de la respuesta
    });
  });
});

app.get("/api/firmas", (req: Request, res: Response) => {
  // Consulta SQL para obtener los usuarios
  const query = `SELECT * FROM archivos_firmados`;

  // Ejecutamos la consulta a la base de datos
  db.query(query, (err: any, results: any) => {
    if (err) {
      console.error("Error al obtener los usuarios:", err);
      return res.status(500).send("Error al obtener los usuarios.");
    }

    // Mapeamos los resultados para estructurarlos si es necesario
    const firmas = results.map((firma: any) => {
      return {
        alias: firma.alias,
        nombre_archivo: firma.nombre_archivo,
        signature: firma.signature, // Si deseas incluir más campos, añádelos aquí
      };
    });

    // Respondemos con el array de usuarios en formato JSON
    res.status(200).json({
      message: "Firmas obtenidas exitosamente",
      firmas, // Devolvemos los usuarios en el cuerpo de la respuesta
    });
  });
});

// Ruta para obtener archivos firmados de la base de datos, incluyendo el contenido
app.post("/api/archivos", (req: Request, res: Response) => {
  const { alias } = req.body;
  // Consulta SQL para obtener todos los archivos firmados
  const query = `SELECT * FROM archivos_subidos WHERE alias = '${alias}'`;

  db.query(query, (err: any, results: any) => {
    if (err) {
      console.error("Error al obtener los archivos:", err);
      return res.status(500).send("Error al obtener los archivos.");
    }

    // Mapeamos los resultados para incluir el contenido del archivo
    const archivos = results.map((archivo: any) => {
      return {
        id: archivo.id,
        nombre_archivo: archivo.nombre_archivo,
        tamano: archivo.tamano,
        tipo_contenido: archivo.tipo_contenido,
        contenido: archivo.archivo.toString("base64"), // Convertimos el BLOB a base64 para enviarlo
        hash: archivo.hash_archivo,
        es_compartido: archivo.es_compartido,
        llave_usuario_comparte: archivo.llave_usuario_comparte,
        alias: archivo.alias,
        usuario_comparte: archivo.usuario_comparte,
      };
    });

    res.status(200).json({
      message: "Archivos obtenidos exitosamente",
      archivos, // Devolvemos los archivos en el cuerpo de la respuesta
    });
  });
});

app.post(
  "/api/sign",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { hash, privateKey, alias, nombre_archivo } = req.body;

    if (!hash || !privateKey) {
      return res
        .status(400)
        .json({ message: "Hash o clave privada no proporcionados." });
    }

    try {
      // Verifica si la clave privada ya tiene el formato correcto
      let privateKeyPem = privateKey;
      if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }

      // Crear la firma utilizando la clave privada
      const sign = crypto.createSign("SHA256");
      sign.update(hash); // Hashear el contenido
      sign.end();

      const signature = sign.sign(
        {
          key: privateKeyPem,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        "base64"
      ); // Firmar y codificar en base64

      // Verificar si ya existe un registro con el alias y nombre_archivo
      const searchQuery = `SELECT * FROM archivos_firmados WHERE alias = ? AND nombre_archivo = ?`;
      db.query(
        searchQuery,
        [alias, nombre_archivo],
        (err: any, result: any) => {
          if (err) {
            console.error(
              "Error al verificar la existencia del registro:",
              err
            );
            return res
              .status(500)
              .json({ message: "Error al verificar el registro." });
          }

          if (result.length > 0) {
            // Si el registro existe, actualizar la firma
            const updateQuery = `UPDATE archivos_firmados SET signature = ? WHERE alias = ? AND nombre_archivo = ?`;
            db.query(
              updateQuery,
              [signature, alias, nombre_archivo],
              (updateErr: any, updateResult: any) => {
                if (updateErr) {
                  console.error("Error al actualizar la firma:", updateErr);
                  return res
                    .status(500)
                    .json({ message: "Error al actualizar la firma." });
                }

                return res.status(200).json({
                  message: "Firma actualizada con éxito",
                  signature,
                });
              }
            );
          } else {
            // Si no existe, insertar un nuevo registro
            const insertQuery = `INSERT INTO archivos_firmados (alias, nombre_archivo, signature) VALUES (?, ?, ?)`;
            db.query(
              insertQuery,
              [alias, nombre_archivo, signature],
              (insertErr: any, insertResult: any) => {
                if (insertErr) {
                  console.error("Error al almacenar la firma:", insertErr);
                  return res
                    .status(500)
                    .json({ message: "Error al almacenar la firma." });
                }

                return res.status(200).json({
                  message: "Firma creada con éxito",
                  signature,
                });
              }
            );
          }
        }
      );
    } catch (error) {
      console.error("Error al firmar el hash:", error);
      res.status(500).json({ message: "Error al firmar el hash." });
    }
  }
);

app.post(
  "/api/verify",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { hash, publicKey, nombre_archivo, alias } = req.body;

    if (!publicKey.startsWith("-----BEGIN PUBLIC KEY-----"))
      return res.status(400).json({ message: "Llave pública no válida" });

    if (!hash || !publicKey) {
      return res
        .status(400)
        .json({ message: "Hash o clave pública no proporcionados." });
    }

    try {
      // Obtener la firma almacenada en la base de datos
      const query = `SELECT signature FROM archivos_firmados WHERE nombre_archivo = ? AND alias = ?`;
      db.query(query, [nombre_archivo, alias], (err: any, result: any) => {
        if (err || result.length === 0) {
          return res
            .status(404)
            .json({ message: "No se encontró la firma para este archivo." });
        }

        const signature = result[0].signature;

        // Crear un verificador usando la clave pública
        const verify = crypto.createVerify("SHA256");
        verify.update(hash);
        verify.end();

        // Verificar la firma
        const isValid = verify.verify(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          signature,
          "base64"
        );

        if (isValid) {
          return res
            .status(200)
            .json({ message: "Firma verificada con éxito" });
        } else {
          return res.status(400).json({ message: "Firma no válida" });
        }
      });
    } catch (error) {
      console.error("Error al verificar la firma:", error);
      res.status(500).json({ message: "Error al verificar la firma." });
    }
  }
);

app.post("/api/refresh-token", (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token requerido" });
  }

  // Verificar el refresh token
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Refresh token no válido" });
    }

    // Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" ,algorithm:"HS256"
      } // Un nuevo access token válido por 15 minutos
    );

    res.status(200).json({ accessToken: newAccessToken });
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
