import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiFolder } from "react-icons/fi"; // Importamos el ícono de carpeta desde react-icons
import { UserCredential } from "../App";

interface FileSignProps {
  userCredential: UserCredential | undefined;
}

export const FileSign = ({ userCredential }: FileSignProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación

  useEffect(() => {
    console.log(userCredential); // Verifica el contenido

    // Redirigir si no hay credenciales
    if (!userCredential || !("id" in userCredential!)) {
      navigate("/");
    }
  }, [userCredential]);

  // Estado para almacenar el índice del archivo seleccionado
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Estado para almacenar los archivos cargados
  const [files, setFiles] = useState<File[]>([]);

  // Referencia al input de tipo file
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Función para manejar la carga de archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]); // Agregar nuevos archivos
    }
  };

  // Función para manejar la selección de un archivo en el grid
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  // Función para cargar archivo (abre el explorador de archivos)
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar el envío del archivo seleccionado
  const handleSignFile = () => {
    if (selectedIndex !== null) {
      const fileToSign = files[selectedIndex];

      // Aquí enviarías el archivo a la base de datos (usando fetch, axios, etc.)
      const formData = new FormData();
      formData.append("file", fileToSign);

      // Ejemplo de cómo enviar el archivo a la base de datos
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Archivo firmado y enviado:", data);
        })
        .catch((error) => {
          console.error("Error al firmar el archivo:", error);
        });
    }
  };

  return (
    <div>
      <div className="bg-slate-900">
        <nav className="p-3 shadow-md border-b border-gray-600 flex items-center justify-between">
          <h1 className="font-bold text-2xl">
            Generador de llaves{" "}
            <span className="text-sky-400">Pública y Privada</span>
          </h1>
          <div className="flex gap-3 font-semibold text-lg">
            <Link
              className="hover:text-sky-400 transition-colors"
              to={"/file-sign"}
            >
              Firmar archivos
            </Link>
            <Link
              className="hover:text-sky-400 transition-colors"
              to={"/generate"}
            >
              Generar llaves
            </Link>
          </div>
        </nav>
      </div>
      {/* Archivos */}
      <section className="w-full mt-10">
        <div>
          <div className="flex gap-5 mx-auto w-1/2 justify-center">
            {files.map((file, index) => (
              <div
                key={index}
                className={`cursor-pointer size-24 rounded-lg p-5 text-center ${
                  selectedIndex === index
                    ? "bg-sky-500"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
                onClick={() => handleSelect(index)}
              >
                {/* Icono de carpeta */}
                <FiFolder size={40} className="mx-auto text-white" />
                {/* Nombre del archivo */}
                <p className="text-white mt-2 text-xs truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para cargar archivo */}
        <div className="flex">
          <button
            className="p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500"
            onClick={handleUploadClick}
          >
            Cargar archivo
          </button>
          {/* Input oculto para seleccionar archivo */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Botón para firmar archivo */}
          <button
            className={`p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500 ${
              selectedIndex === null && "opacity-30"
            }`}
            onClick={handleSignFile}
            disabled={selectedIndex === null} // Desactivar si no hay archivo seleccionado
          >
            Firmar archivo
          </button>
        </div>
      </section>
    </div>
  );
};
