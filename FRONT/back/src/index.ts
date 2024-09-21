import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
const mysql = require("mysql2");

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

// Ruta de ejemplo
app.get("/", (req: Request, res: Response) => {
  res.send("¡Hola desde Express con TypeScript!");
});

// Configura la conexión a MySQL (usando el nombre del servicio 'db' como host)
const db = mysql.createConnection({
  host: "localhost", // El nombre del servicio en docker-compose
  user: "usermy", // Usuario configurado en docker-compose
  password: "usermy", // Contraseña configurada en docker-compose
  database: "userdb", // Base de datos configurada en docker-compose
  port: 13306, // El puerto interno del servicio MySQL en Docker
});

// Conecta a MySQL
db.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err.stack);
    return;
  }
  console.log("Conectado a MySQL con el ID de conexión:", db.threadId);
});

// Ruta para almacenar la llave pública en la base de datos
app.post("/api/storePublicKey", (req, res) => {
  const { publicKey, alias } = req.body;

  const query = `INSERT INTO public_KEY (alias,key_value) VALUES ("${alias}","${publicKey}")`;
  db.query(query, [publicKey], (err, result) => {
    if (err) {
      console.error("Error al almacenar la llave pública:", err);
      return res.status(500).send("Error al almacenar la llave pública.");
    }
    res.status(200).send("Llave pública almacenada exitosamente.");
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
