/* Muro.tsx */
import React, { useState, useEffect } from "react";
import styles from "./components/Muro.module.css";
import PostButton from "./components/PostButton";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

const Muro = () => {
  const [posts, setPosts] = useState([]);
  const userId = localStorage.getItem("user_id");
  useEffect(() => {
    fetch(`http://localhost:3000/api/posts/friends/${userId}`)
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Failed to fetch posts:", error));
  }, []);

  // Función para manejar el like
  const handleLike = async (postId, hasLiked) => {
    try {
      const url = hasLiked
        ? "http://localhost:3000/api/likes/unlike"
        : "http://localhost:3000/api/likes/like";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          postId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar el estado de los posts
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id_publicacion === postId
              ? {
                  ...post,
                  likesCount: hasLiked
                    ? post.likesCount - 1
                    : post.likesCount + 1,
                  hasLiked: !hasLiked,
                }
              : post
          )
        );
      } else {
        console.error("Error al dar/quitar like:", data.message);
      }
    } catch (error) {
      console.error("Error al dar/quitar like:", error);
    }
  };

  return (
    <div className={styles.muro}>
      <div className={styles.backgroundContainerDashboard}>
        <div className={styles.centeredContainerDashboard}>
          <PostButton>Crear Publicación</PostButton>
          <section className={styles.containerDashboard}>
            <div className={styles.postsContainer}>
              {posts.map((post) => (
                <article
                  key={post.id_publicacion}
                  className={styles.dashboardPosts}
                >
                  <div className={styles.postAuthor}>
                    <img
                      src={
                        post.user.avatar
                          ? post.user.avatar.avatar
                          : man_avatar_2
                      }
                      alt="Avatar"
                      width="30"
                      height="30"
                      className="rounded-circle me-2"
                    />
                    <h2>{post.user.username}</h2>
                  </div>
                  <img
                    src={post.cont_media || ejemplo1}
                    alt="Post"
                    className={styles.postImage}
                  />
                  <div className={styles.postDetails}>
                    <div className={styles.postContent}>
                      <p>{post.cont_text}</p>
                    </div>
                    <div className={styles.postInteractions}>
                      <button
                        className={styles.likeButton}
                        onClick={() =>
                          handleLike(post.id_publicacion, post.hasLiked)
                        }
                      >
                        {post.hasLiked ? "💔 Quitar Like" : "❤️ Dar Like"}
                      </button>
                      <span className={styles.likes}>
                        {post.likesCount}{" "}
                        {post.likesCount === 1 ? "Like" : "Likes"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Muro;
