import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware para manejar JSON
app.use(express.json());

// Ruta de ejemplo
app.get("/", (req: Request, res: Response) => {
  res.send("¡Hola desde Express con TypeScript!");
});

/* // Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Cambiar según tu configuración
  password: "password", // Cambiar según tu configuración
  database: "keys_db", // Nombre de tu base de datos
}); */

// Ruta para almacenar la llave pública en la base de datos
/* app.post("/api/storePublicKey", (req, res) => {
  const { publicKey } = req.body;

  const query = "INSERT INTO public_keys (key) VALUES (?)";
  db.query(query, [publicKey], (err, result) => {
    if (err) {
      console.error("Error al almacenar la llave pública:", err);
      return res.status(500).send("Error al almacenar la llave pública.");
    }
    res.status(200).send("Llave pública almacenada exitosamente.");
  });
}); */

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});