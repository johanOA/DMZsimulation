import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiFile } from "react-icons/fi"; // Importamos el ícono de archivo desde react-icons
import { UserCredential } from "../App";

interface FileSignProps {
  userCredential: UserCredential | undefined;
}

export const FileSign = ({ userCredential }: FileSignProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación

  useEffect(() => {
    // Redirigir si no hay credenciales
    if (!userCredential || !("id" in userCredential!)) {
      navigate("/");
    }
  }, [userCredential, navigate]);

  // Estado para almacenar el índice del archivo seleccionado
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Estado para almacenar los archivos cargados
  const [files, setFiles] = useState<File[]>([]);

  // Referencia al input de tipo file
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Efecto para cargar archivos desde el endpoint
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/archivos"); // Cambia la URL si es necesario
        const data = await response.json();
        
        // Suponiendo que la respuesta es un array de objetos con las propiedades: nombre_archivo, tamano, tipo_contenido, archivo (en base64)
        const loadedFiles = data.archivos.map((file: any) => {
          const blob = new Blob([new Uint8Array(atob(file.contenido).split("").map(c => c.charCodeAt(0)))], { type: file.tipo_contenido });
          return new File([blob], file.nombre_archivo, { type: file.tipo_contenido });
        });

        console.log(loadedFiles)

        setFiles(loadedFiles);
      } catch (error) {
        console.error("Error al cargar los archivos:", error);
      }
    };

    fetchFiles();
  }, []);

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
  const saveFile = () => {
    if (selectedIndex !== null) {
      const fileToSave = files[selectedIndex];

      // Usamos FileReader para leer el archivo como ArrayBuffer
      const reader = new FileReader();

      reader.onload = function (event) {
        if (event.target && event.target.result) {
          // Convertimos el ArrayBuffer en un Uint8Array (arreglo de bytes)
          const byteArray = new Uint8Array(event.target.result as ArrayBuffer);

          // Creación del objeto de datos para enviar
          const formData = new FormData();
          formData.append("nombre_archivo", fileToSave.name); // Nombre del archivo
          formData.append("tamano", fileToSave.size.toString()); // Tamaño del archivo
          formData.append("tipo_contenido", fileToSave.type); // Tipo de contenido
          formData.append("archivo", new Blob([byteArray])); // El arreglo de bytes como Blob

          // Enviamos el arreglo de bytes y otros datos al servidor
          fetch("http://localhost:4000/api/upload", {
            method: "POST",
            body: formData, // Enviamos formData que contiene todos los datos
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

      // Leer el archivo como ArrayBuffer
      reader.readAsArrayBuffer(fileToSave);
    }
  };

  // Función para manejar la descarga del archivo seleccionado
  const handleDownloadFile = () => {
    if (selectedIndex !== null) {
      const fileToDownload = files[selectedIndex];
      const url = URL.createObjectURL(fileToDownload);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileToDownload.name; // Nombre con el que se descargará el archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Liberar el objeto URL
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
                {/* Icono de archivo */}
                <FiFile size={40} className="mx-auto text-white" />
                {/* Nombre del archivo */}
                <p className="text-white mt-2 text-xs truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para cargar archivo */}
        <div className="flex mt-20 justify-evenly w-full mx-auto">
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
            onClick={saveFile}
            disabled={selectedIndex === null} // Desactivar si no hay archivo seleccionado
          >
            Guardar archivo
          </button>

          {/* Botón para descargar archivo */}
          <button
            className={`p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500 ${
              selectedIndex === null && "opacity-30"
            }`}
            onClick={handleDownloadFile}
            disabled={selectedIndex === null} // Desactivar si no hay archivo seleccionado
          >
            Descargar archivo
          </button>
        </div>
      </section>
    </div>
  );
};
