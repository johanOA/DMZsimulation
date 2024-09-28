import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
const mysql = require("mysql2");
import multer from "multer"; // Importamos multer

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de CORS
const corsOptions: CorsOptions = {
  origin: "http://localhost:5173", // Permite solo solicitudes desde localhost:5173
  methods: ["GET", "POST"], // Métodos permitidos
  allowedHeaders: ["Content-Type"], // Cabeceras permitidas
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

// Ruta para almacenar la llave pública en la base de datos
app.post("/api/storePublicKey", (req: Request, res: Response) => {
  const { publicKey, alias } = req.body;

  const query = `INSERT INTO public_KEY (alias, key_value) VALUES (?, ?)`;
  db.query(query, [alias, publicKey], (err: any, result: any) => {
    if (err) {
      console.error("Error al almacenar la llave pública:", err);
      return res.status(500).send("Error al almacenar la llave pública.");
    }
    res.status(200).send("Llave pública almacenada exitosamente.");
  });
});

// Ruta para recibir archivo y metadatos
app.post("/api/upload", upload.single("archivo"), (req: Request, res: Response) => {
  const { nombre_archivo, tamano, tipo_contenido } = req.body; // Extraemos los metadatos del archivo
  const fileBuffer = req.file?.buffer; // Obtenemos el buffer del archivo desde req.file

  if (!fileBuffer || fileBuffer.length === 0) {
    return res.status(400).send("No se ha enviado ningún archivo.");
  }

  // Consulta SQL para insertar el archivo y sus metadatos en la base de datos
  const query = `
    INSERT INTO archivos_firmados (nombre_archivo, tamano, tipo_contenido, archivo) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [nombre_archivo, tamano, tipo_contenido, fileBuffer], (err: any, result: any) => {
    if (err) {
      console.error("Error al almacenar el archivo:", err);
      return res.status(500).send("Error al almacenar el archivo.");
    }

    res.status(200).json({
      message: "Archivo almacenado exitosamente",
      fileId: result.insertId, // Retornamos el ID del archivo insertado
    });
  });
});

// Ruta para obtener archivos firmados de la base de datos, incluyendo el contenido
app.get("/api/archivos", (req: Request, res: Response) => {
  // Consulta SQL para obtener todos los archivos firmados
  const query = `SELECT id, nombre_archivo, tamano, tipo_contenido, archivo FROM archivos_firmados`;

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
        contenido: archivo.archivo.toString('base64'), // Convertimos el BLOB a base64 para enviarlo
      };
    });

    res.status(200).json({
      message: "Archivos obtenidos exitosamente",
      archivos, // Devolvemos los archivos en el cuerpo de la respuesta
    });
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
