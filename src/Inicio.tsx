import { useState, useEffect } from "react";
import Button from "./components/Button";
import LogInForm from "./components/LogInForm";
import "./components/App.module.css";

const Inicio = () => {
  const [formLogIn, setFormLogIn] = useState(false);

  // Manejo de clases del body para la página de inicio
  useEffect(() => {
    const body = document.body;
    body.classList.add("home-page");

    // Limpiar efecto al desmontar el componente
    return () => {
      body.classList.remove("home-page");
    };
  }, []);

  const handleClick = () => setFormLogIn(!formLogIn);

  return (
    <div>
      {formLogIn ? (
        <LogInForm />
      ) : (
        <Button formLogIn={formLogIn} onClick={handleClick}>
          COMENZAR
        </Button>
      )}
    </div>
  );
};

export default Inicio;
