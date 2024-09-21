import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GenerateKeys } from "./components/GenerateKeys";
import { Login } from "./components/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import { FileSign } from "./components/FileSign";

export interface UserCredential {
  id: string; // o sub
  accessToken: string;
  // Otras propiedades según necesites
}

function App() {
  const [userCredential, setUserCredential] = useState<UserCredential>();
  return (
    <GoogleOAuthProvider clientId="688555993389-5dn064omerjdqrjkf9c6knl97d4miq9i.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Rutas de la sección de autenticación */}
          <Route path="/" element={<Login setUserCredential={setUserCredential} />} />
          <Route path="/generate" element={<GenerateKeys userCredential={userCredential} />} />
          <Route path="/file-sign" element={<FileSign userCredential={userCredential} />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
