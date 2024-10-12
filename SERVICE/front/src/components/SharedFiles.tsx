import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCredential } from "../App";
import { FiFile } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

interface SharedFilesProps {
  userCredential: UserCredential | undefined;
  globalPublicKey: string | undefined;
}

interface hash {
  name: string;
  hash: string;
  es_compartido: number;
  alias: string;
  usuario_comparte: string;
  llave_usuario_comparte: string;
}

interface User {
  username: string;
  user_pass: string;
}

interface firma {
  alias: string;
  nombre_archivo: string;
  signature: number;
}

export const SharedFiles = ({
  userCredential,
  globalPublicKey,
}: SharedFilesProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación
  const [files, setFiles] = useState<File[]>([]);
  const [hashes, setHashes] = useState<hash[]>([]);
  const [firmas, setFirmas] = useState<firma[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false); // Estado para controlar el div
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!userCredential || !("id" in userCredential!)) {
      navigate("/");
    }
  }, [userCredential, navigate]);

  useEffect(() => {
    const fetchSigns = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/firmas"); // URL de tu API
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios");
        }
        const data = await response.json();
        setFirmas(data.firmas); // Asumimos que la API devuelve un campo `usuarios`
      } catch (err) {
        console.log(err);
      }
    };
    fetchSigns();
  }, [selectedIndex]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const alias = userCredential?.id;
        const response = await fetch("http://localhost:4000/api/archivos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Asegura que el servidor sepa que estás enviando JSON.
          },
          body: JSON.stringify({
            alias, // Asegúrate de que este valor no sea `undefined` o `null`.
          }),
        });
        const data = await response.json();

        setHashes(
          data.archivos.map((file: any) => {
            return {
              name: file.nombre_archivo,
              hash: file.hash,
              es_compartido: file.es_compartido,
              usuario_comparte: file.usuario_comparte,
              alias: file.alias,
              llave_usuario_comparte: file.llave_usuario_comparte,
            };
          })
        );

        const loadedFiles = data.archivos.map((file: any) => {
          const blob = new Blob(
            [
              new Uint8Array(
                atob(file.contenido)
                  .split("")
                  .map((c) => c.charCodeAt(0))
              ),
            ],
            { type: file.tipo_contenido }
          );
          return new File([blob], file.nombre_archivo, {
            type: file.tipo_contenido,
          });
        });

        setFiles(loadedFiles);
      } catch (error) {
        console.error("Error al cargar los archivos:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  useEffect(() => {
    if (selectedIndex !== null) {
      const filter = hashes.find(
        (hash) => hash.name === files[selectedIndex].name
      );
      setSelectedHash(filter?.hash!);
    }
  }, [selectedIndex]);

  const handleVerifyFile = async () => {
    // Usar esta función antes de hacer cualquier solicitud protegida
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      await refreshAccessToken();
    }
    if (selectedHash) {
      try {
        const file = hashes.find(
          (item) => item.name === files[selectedIndex!].name
        );

        const response = await fetch("http://localhost:4000/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCredential?.accessToken}`, // Token JWT
          },
          body: JSON.stringify({
            hash: selectedHash,
            publicKey,
            nombre_archivo: files[selectedIndex!].name,
            alias: file?.usuario_comparte,
          }),
        });
        const result = await response.json();
        if (result.message === "Hash o clave pública no proporcionados.") {
          toast.warning(result.message);
        }
        if (result.message === "Firma no válida") {
          toast.error(result.message);
        }
        if (result.message === "Llave pública no válida") {
          toast.error(result.message);
        }
        if (result.message === "Firma verificada con éxito") {
          toast.success(result.message);
        }
      } catch (error) {
        toast.error("Error al verificar el archivo:");
        console.error("Error al verificar el archivo", error);
      }
    }
  };

  const getKey = (key: string) => {
    navigator.clipboard
      .writeText(key)
      .then(() => {
        console.log("Key copied to clipboard");
        toast.success("Llave copiada");
      })
      .catch((err) => {
        console.error("Failed to copy key: ", err);
      });
  };

  const fetchPrivateKey = async () => {
    return new Promise<string>((resolve, reject) => {
      // Crear un elemento de entrada para archivos
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pem"; // Aceptar solo archivos .pem

      // Evento que se activa cuando se selecciona un archivo
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement; // Afirmación de tipo
        if (target && target.files && target.files.length > 0) {
          const file = target.files[0]; // Obtener el primer archivo seleccionado
          const reader = new FileReader();

          // Evento que se activa cuando se ha leído el archivo
          reader.onload = (e) => {
            const content = e.target?.result as string; // Obtener el contenido del archivo
            resolve(content); // Retornar el contenido del archivo
          };

          // Manejar errores al leer el archivo
          reader.onerror = () => {
            reject(new Error("Error al leer el archivo."));
          };

          // Leer el archivo como texto
          reader.readAsText(file);
        } else {
          reject(new Error("No se seleccionó ningún archivo."));
        }
      };

      // Abrir el explorador de archivos
      input.click();
    });
  };

  const refreshAccessToken = async () => {
    const refreshToken = Cookies.get("refreshToken");
    const response = await fetch("http://localhost:4000/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (data.accessToken) {
      // Guardar el nuevo access token
      Cookies.set("accessToken", data.accessToken, { expires: 1 / 24 });
    }
  };

  const handleSignFile = async () => {
    // Usar esta función antes de hacer cualquier solicitud protegida
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      await refreshAccessToken();
    }
    if (selectedHash) {
      if (!globalPublicKey) {
        toast.error("Genere una llave pública antes de firmar");
        return;
      }
      try {
        let privateKey = await fetchPrivateKey(); // Obtener la clave privada
        const response = await fetch("http://localhost:4000/api/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCredential?.accessToken}`, // Token JWT
          },
          body: JSON.stringify({
            hash: selectedHash,
            privateKey,
            alias: userCredential?.id,
            nombre_archivo: files[selectedIndex!].name,
          }),
        });

        const result = await response.json();
        toast.success(result.message);
      } catch (error) {
        console.error("Error al firmar el archivo:", error);
      }
    } else {
      console.log("No se ha seleccionado ningún hash."); // Mensaje adicional
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users");
        const data = await response.json();

        setUsers(data.usuarios);
      } catch (error) {
        console.error("Error al cargar los archivos:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleButtonClick = () => {
    setShowOverlay(true); // Mostrar el div al hacer clic
  };

  const generateHash = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  console.log(hashes);

  const handleCompartirArchivo = async (username: string) => {
    if (!globalPublicKey) {
      toast.error("Genere una llave pública antes de compartir");
      return;
    }

    if (selectedIndex !== null) {
      const fileToSave = files[selectedIndex];
      const fileHash = await generateHash(fileToSave);
      setSelectedHash(fileHash); // Guardar el hash seleccionado

      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target && event.target.result) {
          const id = userCredential?.id;
          const byteArray = new Uint8Array(event.target.result as ArrayBuffer);
          const formData = new FormData();
          formData.append("nombre_archivo", fileToSave.name);
          formData.append("tamano", fileToSave.size.toString());
          formData.append("tipo_contenido", fileToSave.type);
          formData.append("archivo", new Blob([byteArray]));
          formData.append("hash_archivo", fileHash); // Adjuntar el hash al FormData
          formData.append("alias", username); // Adjuntar el hash al FormData
          formData.append("usuario_comparte", id!); // Adjuntar el hash al FormData

          if (globalPublicKey) {
            formData.append("llave_usuario_comparte", globalPublicKey); // Adjuntar el hash al FormData
          }

          try {
            const response = await fetch("http://localhost:4000/api/share", {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            toast.success(data.message);
          } catch (error) {
            console.error("Error al firmar el archivo:", error);
          }
        }
      };

      reader.readAsArrayBuffer(fileToSave);
    }
  };
  const processedFiles = new Set(); // Usamos un Set para evitar duplicados
  return (
    <div>
      <nav className="p-3 shadow-md border-b border-gray-600 flex items-center justify-between">
        <h1 className="font-bold text-2xl">
          Diplomado Infraestructura{" "}
          <span className="text-indigo-600">Firma Digital</span>
        </h1>
        <div className="flex gap-3 font-semibold text-lg">
          <Link
            className="hover:text-indigo-600 transition-colors"
            to={"/mis-compartidos"}
          >
            Mis compartidos
          </Link>
          <Link
            className="hover:text-indigo-600 transition-colors"
            to={"/file-sign"}
          >
            Mis archivos
          </Link>
          <Link
            className="hover:text-indigo-600 transition-colors"
            to={"/generate"}
          >
            Generar llaves
          </Link>
        </div>
      </nav>
      <section className="flex mt-10 mx-auto w-2/3">
        {/* Lista de archivos */}
        <div className="w-1/2">
          <h2 className="text-center mb-5 text-xl font-semibold">
            Archivos compartidos conmigo
          </h2>
          <div className="flex gap-5 mx-auto justify-center">
            {files.map((file, index) => {
              const found = hashes.find(
                (item) => item.name === file.name && item.es_compartido === 1
              );

              // Si ya procesamos este archivo, lo saltamos
              if (found && !processedFiles.has(file.name)) {
                processedFiles.add(file.name); // Marcamos el archivo como procesado
                return (
                  <div
                    key={index}
                    className={`cursor-pointer transition-colors size-24 rounded-lg p-5 text-center ${
                      selectedIndex === index
                        ? "bg-indigo-700"
                        : "bg-indigo-400 hover:bg-indigo-700"
                    }`}
                    onClick={() => handleSelect(index)}
                  >
                    <FiFile size={40} className="mx-auto text-white" />
                    <p className="text-white mt-2 text-xs truncate">
                      {file.name}
                    </p>
                  </div>
                );
              }

              // Si no cumple con las condiciones o ya fue procesado, no renderizamos nada
              return null;
            })}
          </div>
        </div>
        {/* Lista usuarios que firmaron */}
        <div className="w-1/2">
          <h2 className="text-center mb-5 text-xl font-semibold">
            Usuarios que han firmado el archivo
          </h2>
          {selectedIndex !== null && (
            <>
              <p></p>
              <div className="rounded-lg bg-white p-2 space-y-2">
                {firmas.map((firma, index) => {
                  if (firma.nombre_archivo === files[selectedIndex!].name) {
                    const found = hashes.find(
                      (hash) =>
                        hash.usuario_comparte === firma.alias &&
                        hash.name === firma.nombre_archivo
                    );
                    if (found) {
                      return (
                        <div
                          key={index}
                          className={`flex justify-between rounded-lg p-2 px-3 ${
                            found ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <div>{firma.alias}</div>
                          <button
                            className="hover:underline font-semibold"
                            onClick={() => getKey(found.llave_usuario_comparte)}
                          >
                            Copiar llave
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={index}
                          className={`p-2 px-3 rounded-lg ${
                            found ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          {firma.alias}
                        </div>
                      );
                    }
                  }
                })}
              </div>
            </>
          )}
        </div>
      </section>
      {selectedIndex !== null && (
        <section className="mt-8 mx-auto">
          <h2 className="text-center text-xl font-semibold">
            Llave pública para verificación:
          </h2>
          <textarea
            className="border-2 rounded-md mx-auto block w-[700px] h-40 mt-5 resize-none text-black"
            name="public_key"
            id="public_key"
            onChange={(e) => setPublicKey(e.target.value)}
            value={publicKey}
          />
          <div className="flex mt-10 justify-between w-2/3 mx-auto">
            <button
              className={`p-2 bg-slate-800 rounded-md disabled:opacity-25 text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-slate-700 ${
                selectedIndex === null && "opacity-30"
              }`}
              onClick={handleVerifyFile}
              disabled={selectedIndex === null}
            >
              Verificar archivo
            </button>
            <button
              className={`p-2 bg-pink-700 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-pink-600 ${
                selectedIndex === null && "opacity-30"
              }`}
              onClick={handleSignFile}
              disabled={selectedIndex === null}
            >
              Firmar archivo
            </button>
            <div className="relative mx-auto block">
              <button
                className={`p-2 bg-yellow-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-yellow-700 ${
                  selectedIndex === null && "opacity-30"
                }`}
                onClick={handleButtonClick}
                disabled={selectedIndex === null}
              >
                Compartir archivo
              </button>

              {showOverlay && (
                <div className="absolute -top-28 left-0 w-96 h-full bg-white bg-opacity-90 flex items-center justify-center z-50">
                  <div className="p-5 bg-white shadow-lg rounded-lg w-full">
                    <div className="bg-gray-100 rounded-lg">
                      {users.length > 0 &&
                        users.map((user, index) => {
                          if (user.username !== userCredential?.id) {
                            return (
                              <div
                                className="bg-gray-100 p-2 px-3 hover:bg-gray-200 rounded-lg flex items-center justify-between"
                                key={index}
                              >
                                <p>{user.username}</p>
                                <button
                                  onClick={() =>
                                    handleCompartirArchivo(user.username)
                                  }
                                  className="text-blue-500 font-semibold"
                                >
                                  Compartir
                                </button>
                              </div>
                            );
                          }
                        })}
                    </div>
                    <button
                      className="mt-3 p-2 bg-gray-800 text-white rounded-md"
                      onClick={() => setShowOverlay(false)} // Cerrar el div
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <ToastContainer pauseOnHover={false} />
    </div>
  );
};
