import { ReactNode } from "react";
import styles from "./App.module.css";

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  formLogIn: boolean;
};

function Button({ children, onClick, formLogIn }: ButtonProps) {
  return (
    <button
      disabled={formLogIn}
      onClick={onClick}
      type="button"
      className={styles.centeredButton}
    >
      {children}
    </button>
  );
}

export default Button;
