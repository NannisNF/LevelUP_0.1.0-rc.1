// AddFriendButton.tsx
import React, { useState } from "react";
import styles from "./Perfil.module.css";

type AddFriendButtonProps = {
  children: React.ReactNode;
  onClick: () => void; // Función para manejar el clic
};

const AddFriendButton = ({ children, onClick }: AddFriendButtonProps) => {
  return (
    <button type="button" className={styles.friendButton} onClick={onClick}>
      {children}
    </button>
  );
};

export default AddFriendButton;
