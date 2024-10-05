import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserCredential } from "../App";

interface LoginProps {
  setUserCredential: React.Dispatch<React.SetStateAction<UserCredential | undefined>>;
}

export const Login = ({ setUserCredential }: LoginProps) => {
  const navigate = useNavigate();

  console.log(window.location.origin);
  const registerUser = async (userInfo: any) => {
    try {
      const email = userInfo.email;
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // ID único del usuario
          // Puedes extraer otros campos de userInfo según sea necesario
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el usuario');
      }

      const data = await response.json();
      console.log('Usuario registrado:', data);
    } catch (error) {
      console.error(error);
    }
  };

  const loginUser = async (userInfo: any) => {
    try {
      const email = userInfo.email;
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // ID único del usuario o nombre de usuario
          // Aquí puedes agregar más campos como email o nombre si es necesario
        }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      const data = await response.json();
      setUserCredential({
        id: userInfo.sub,
        accessToken: data.token, // Guardar el token JWT
      });

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
    </div>
  );
};
