import { useState } from "react";

function App() {
  const [publicKey, setPublicKey] = useState<string>("");

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
      ["encrypt", "decrypt"]
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

    // Guardar la llave pública en el estado
    setPublicKey(publicKeyPem);

    // Descargar la llave privada directamente después de generarla
    downloadPrivateKey(privateKeyPem);

    // Almacenar la llave pública en la base de datos
    storePublicKeyInDatabase(publicKeyPem);
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
    await fetch("http://localhost:3000/api/storePublicKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicKey: publicKeyPem }),
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

  return (
    <>
      <div className="bg-slate-900">
        <nav className="p-3 shadow-md border-b border-gray-600">
          <h1 className="font-bold text-2xl">
            Generador de llaves{" "}
            <span className="text-sky-400">Pública y Privada</span>
          </h1>
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
      </main>
      <button
        onClick={() => {
          generateKeyPair();
        }}
        className="p-2 bg-sky-600 rounded-md text-white mx-auto block mt-5 px-5 font-semibold transition-all ease-linear hover:bg-sky-500"
      >
        Generar par de llaves
      </button>
    </>
  );
}

export default App;
