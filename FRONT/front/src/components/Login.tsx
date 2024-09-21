import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  setUserCredential: React.Dispatch<React.SetStateAction<{}>>;
}

export const Login = ({ setUserCredential }: LoginProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación

  return (
    <div className="pt-10">
      <h1 className="text-center text-2xl mx-auto font-semibold">
        Inicio de Sesión
      </h1>
      <div className="w-full flex justify-center mt-5">
        {" "}
        {/* Flex para centrar */}
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            setUserCredential(credentialResponse);
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
