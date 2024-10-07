import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCredential } from "../App";

interface GenerateKeysProps {
  userCredential: UserCredential | undefined;
  setGlobalPublicKey: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const GenerateKeys = ({
  userCredential,
  setGlobalPublicKey,
}: GenerateKeysProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación

  useEffect(() => {
    // Redirigir si no hay credenciales
    if (!userCredential || !("id" in userCredential!)) {
      navigate("/");
    }
  }, [userCredential]);

  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKeyObject, setPublicKeyObject] = useState<CryptoKey | null>(
    null
  ); // Almacena la clave pública
  const [message, setMessage] = useState<string>("");
  const [encryptedMessage, setEncryptedMessage] = useState<string>("");
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");

  console.log(decryptedMessage);
  console.log(setMessage);

  // Función para generar el par de llaves RSA
  const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"] // Permisos para las operaciones de cifrado y descifrado
    );

    // Exportar la llave pública
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    // Convertir las llaves a formato PEM
    const publicKeyPem = convertArrayBufferToPem(
      exportedPublicKey,
      "PUBLIC KEY"
    );
    const privateKeyPem = convertArrayBufferToPem(
      exportedPrivateKey,
      "PRIVATE KEY"
    );

    setGlobalPublicKey(publicKeyPem);

    const llave = arrayBufferToBase64(exportedPublicKey);

    // Guardar la llave pública y privada en el estado
    setPublicKey(publicKeyPem);
    setPrivateKey(keyPair.privateKey);
    setPublicKeyObject(keyPair.publicKey); // Guardar la clave pública en un objeto

    // Descargar la llave privada directamente después de generarla
    downloadPrivateKey(privateKeyPem);

    // Almacenar la llave pública en la base de datos
    storePublicKeyInDatabase(llave);
  };

  // Convertir de buffer a string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary); // Codifica a base64
  };

  // Función para convertir ArrayBuffer a formato PEM
  const convertArrayBufferToPem = (
    buffer: ArrayBuffer,
    type: string
  ): string => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    const base64 = window.btoa(binary);
    const pem = `-----BEGIN ${type}-----\n${base64
      .match(/.{1,64}/g)
      ?.join("\n")}\n-----END ${type}-----`;
    return pem;
  };

  // Función para almacenar la llave pública en la base de datos
  const storePublicKeyInDatabase = async (publicKeyPem: string) => {
    await fetch("http://localhost:4000/api/storePublicKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: publicKeyPem,
        alias: userCredential?.id,
      }),
    });
  };

  // Función para descargar la llave privada
  const downloadPrivateKey = (privateKeyPem: string) => {
    const blob = new Blob([privateKeyPem], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "private_key.pem";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para encriptar el mensaje con la llave pública
  const encryptMessage = async () => {
    if (!publicKeyObject) return;

    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    // Encriptar el mensaje con la clave pública
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKeyObject,
      encodedMessage
    );

    // Convertir a Base64 para mostrar el mensaje cifrado
    const encryptedBase64 = window.btoa(
      String.fromCharCode(...new Uint8Array(encryptedData))
    );
    setEncryptedMessage(encryptedBase64);
    encryptMessage();
  };

  // Función para desencriptar el mensaje con la llave privada
  const decryptMessage = async () => {
    if (!privateKey) return;
    decryptMessage();

    const encryptedData = Uint8Array.from(atob(encryptedMessage), (c) =>
      c.charCodeAt(0)
    );

    // Desencriptar el mensaje con la clave privada
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedData);
    setDecryptedMessage(decryptedText);
  };
  return (
    <>
      <div className="bg-white">
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
      </div>
      <main className="w-full">
        <h2 className="text-center text-2xl mt-6 font-semibold">
          Llave Pública
        </h2>
        <textarea
          className="border-2 rounded-md mx-auto block w-[700px] h-40 mt-5 resize-none text-black"
          name="public_key"
          id="public_key"
          readOnly
          value={publicKey}
        />
        {/*      <h2 className="text-center text-2xl mt-6 font-semibold">
          Mensaje
        </h2>
        <textarea
          className="border-2 rounded-md mx-auto block w-[700px] h-20 mt-5 resize-none text-black"
          placeholder="Escribe tu mensaje aquí"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={encryptMessage}
          className="p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500"
        >
          Encriptar Mensaje
        </button>
        <h2 className="text-center text-2xl mt-6 font-semibold">
          Mensaje Encriptado
        </h2>
        <textarea
          className="border-2 rounded-md mx-auto block w-[700px] h-40 mt-5 resize-none text-black"
          readOnly
          value={encryptedMessage}
        />
        <button
          onClick={decryptMessage}
          className="p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500"
        >
          Desencriptar Mensaje
        </button>
        <h2 className="text-center text-2xl mt-6 font-semibold">
          Mensaje Desencriptado
        </h2>
        <textarea
          className="border-2 rounded-md mx-auto block w-[700px] h-20 mt-5 resize-none text-black"
          readOnly
          value={decryptedMessage}
        /> */}
      </main>
      <button
        onClick={() => {
          generateKeyPair();
        }}
        className="p-2 bg-indigo-700 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-indigo-500"
      >
        Generar par de llaves
      </button>
    </>
  );
};
