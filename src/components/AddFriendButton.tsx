// AddFriendButton.tsx
import React from "react";
import styles from "./Perfil.module.css";

type AddFriendButtonProps = {
  children: React.ReactNode;
  onClick: () => void; // Clic de solicitud
};

const AddFriendButton = ({ children, onClick }: AddFriendButtonProps) => {
  return (
    <button type="button" className={styles.friendButton} onClick={onClick}>
      {children}
    </button>
  );
};

export default AddFriendButton;
