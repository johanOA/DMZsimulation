import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { UserCredential } from "../App";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';

interface LoginProps {
  setUserCredential: React.Dispatch<
    React.SetStateAction<UserCredential | undefined>
  >;
}

export const Login = ({ setUserCredential }: LoginProps) => {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const registerUser = async (userInfo: any) => {
    try {
      const email = userInfo.email;
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // ID único del usuario
          // Puedes extraer otros campos de userInfo según sea necesario
        }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el usuario");
      }

      const data = await response.json();
      console.log("Usuario registrado:", data);
    } catch (error) {
      console.error(error);
    }
  };

  const loginUser = async (userInfo: any) => {
    try {
      const email = userInfo.email;
  
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Enviar el email como ID único para identificar al usuario
          // Aquí puedes agregar otros campos si es necesario
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }
  
      const data = await response.json();
  
      // Guardar el access token y refresh token en cookies
      Cookies.set("accessToken", data.accessToken, { expires: 1 / 24 }); // Expira en 15 minutos
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 }); // Expira en 7 días
  
      // Almacenar las credenciales del usuario con el accessToken
      setUserCredential({
        id: email,
        accessToken: data.accessToken, // Guardar el access token JWT
      });
  
      // Redirigir al usuario a la página de "generate"
      navigate("/generate");
  
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user, // Se envía el usuario y contraseña como en tu código original
          pass
        }),
      });
  
      if (!response.ok) {
        toast.error("Credenciales incorrectas");
        throw new Error("Error al iniciar sesión");
      }
  
      const data = await response.json();
  
      // Guardar el access token y refresh token en cookies
      Cookies.set("accessToken", data.accessToken, { expires: 1 / 24 }); // El access token expira en 15 minutos (1/24 días)
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 }); // El refresh token expira en 7 días
  
      // Almacenar las credenciales del usuario con el accessToken
      setUserCredential({
        id: user,
        accessToken: data.accessToken, // Guardar el access token JWT
      });
  
      // Redirigir al usuario a la página de "generate" después de iniciar sesión
      navigate("/generate");
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="pt-10">
      <h1 className="text-center text-2xl mx-auto font-semibold">
        Inicio de Sesión
      </h1>
      <form
        onSubmit={(e) => handleSubmitLogin(e)}
        className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-md"
      >
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 font-semibold mb-2"
          >
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 font-semibold mb-2"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setPass(e.target.value)}
            value={pass}
          />
        </div>
        <input
          type="submit"
          value="Iniciar Sesión"
          className="w-full cursor-pointer bg-blue-500 text-white p-2 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        />
        <Link
          className="mt-5 hover:underline block text-indigo-700 font-semibold"
          to={"/register"}
        >
          Registrarme
        </Link>
      </form>

      <div className="w-full flex justify-center mt-5">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const userInfo = JSON.parse(
              atob(credentialResponse?.credential!.split(".")[1])
            );

            // Intentar registrar al usuario
            await registerUser(userInfo);
            // Luego, iniciar sesión para obtener el token JWT
            await loginUser(userInfo);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
      <ToastContainer pauseOnHover={false} />
    </div>
  );
};
