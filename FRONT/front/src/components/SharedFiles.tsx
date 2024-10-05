import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCredential } from "../App";

interface SharedFilesProps {
  userCredential: UserCredential | undefined;
}

export const SharedFiles = ({ userCredential }: SharedFilesProps) => {
  const navigate = useNavigate(); // Inicializa el hook para navegación

  useEffect(() => {
    if (!userCredential || !("id" in userCredential!)) {
      navigate("/");
    }
  }, [userCredential, navigate]);

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
    </div>
  );
};
