import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GenerateKeys } from "./components/GenerateKeys";
import { Login } from "./components/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import { FileSign } from "./components/FileSign";
import { SharedFiles } from "./components/SharedFiles";
import { Register } from "./components/Register";

export interface UserCredential {
  id: string; // o sub
  accessToken: string;
  // Otras propiedades según necesites
}

function App() {
  const [userCredential, setUserCredential] = useState<UserCredential>();
  const [globalPublicKey, setGlobalPublicKey] = useState<string>();
  return (
    <GoogleOAuthProvider clientId="688555993389-5dn064omerjdqrjkf9c6knl97d4miq9i.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Rutas de la sección de autenticación */}
          <Route path="/" element={<Login setUserCredential={setUserCredential} />} />
          <Route path="/generate" element={<GenerateKeys userCredential={userCredential} setGlobalPublicKey={setGlobalPublicKey} />} />
          <Route path="/file-sign" element={<FileSign userCredential={userCredential} globalPublicKey={globalPublicKey} />} />
          <Route path="/mis-compartidos" element={<SharedFiles userCredential={userCredential} globalPublicKey={globalPublicKey} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
