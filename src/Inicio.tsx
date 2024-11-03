import { useState, useEffect } from "react";
import Button from "./components/Button";
import LogInForm from "./components/LogInForm";
import "./components/App.module.css";

const Inicio = () => {
  const [formLogIn, setFormLogIn] = useState(false);

  useEffect(() => {
    const body = document.body;
    body.classList.add("home-page");

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
