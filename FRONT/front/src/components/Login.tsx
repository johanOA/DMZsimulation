import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserCredential } from "../App";

interface LoginProps {
  setUserCredential: React.Dispatch<React.SetStateAction<UserCredential | undefined>>
}

export const Login = ({ setUserCredential }: LoginProps) => {
  const navigate = useNavigate();

  return (
    <div className="pt-10">
      <h1 className="text-center text-2xl mx-auto font-semibold">
        Inicio de Sesión
      </h1>
      <div className="w-full flex justify-center mt-5">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const userInfo = JSON.parse(
              atob(credentialResponse?.credential!.split(".")[1])
            );
            setUserCredential({
              id: userInfo.sub, // Almacena el sub como ID único
              accessToken: credentialResponse.credential!,
            });
            navigate("/generate");
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
    </div>
  );
};
