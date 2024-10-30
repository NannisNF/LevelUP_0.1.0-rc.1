import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PostForm from "./components/PostForm";
import styles from "./components/Post.module.css";

const PostFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleClose = () => {
    navigate(from);
  };

  return (
    <div className={styles.postFormPageContainer}>
      <PostForm onClose={handleClose} />
    </div>
  );
};

export default PostFormPage;
