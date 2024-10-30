import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Post.module.css";

type PostButtonProps = {
  children: React.ReactNode;
};

function PostButton({ children }: PostButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    navigate("/crear-publicacion", { state: { from: location.pathname } });
  };

  return (
    <button type="button" className={styles.postButton} onClick={handleClick}>
      {children}
    </button>
  );
}

export default PostButton;
