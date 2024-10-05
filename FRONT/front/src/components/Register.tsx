import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Register = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user,
          pass,
        }),
      });

      if (response.ok) {
        toast.success("Usuario registrado");
      }

      if (!response.ok) {
        throw new Error("Error al registrar el usuario");
      }

      const data = await response.json();
      console.log("Usuario registrado:", data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <h1 className="text-center text-2xl mx-auto font-semibold pt-10">
        Registro
      </h1>
      <section>
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
            value="Registrarme"
            className="w-full cursor-pointer bg-blue-500 text-white p-2 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          />
          <Link
            className="mt-5 hover:underline text-indigo-700 font-semibold block"
            to={"/"}
          >
            Iniciar Sesión
          </Link>
        </form>
      </section>
      <ToastContainer pauseOnHover={false} />
    </div>
  );
};
