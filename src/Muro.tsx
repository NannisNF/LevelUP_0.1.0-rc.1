import { useState, useEffect } from "react";
import styles from "./components/Muro.module.css";
import PostButton from "./components/PostButton";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

interface Post {
  id_publicacion: number;
  user: {
    username: string;
    avatar?: {
      avatar: string;
    } | null;
  };
  cont_media?: string | null;
  cont_text?: string | null;
  likesCount: number;
  hasLiked: boolean;
}

const Muro = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const userIdString = localStorage.getItem("user_id");
  if (!userIdString) {
    console.error("User ID is null or undefined");
    return <div>Error: Usuario no autenticado</div>;
  }
  const userId = parseInt(userIdString, 10);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/posts/friends/${userId}`)
      .then((response) => response.json())
      .then((data: Post[]) => setPosts(data))
      .catch((error) => console.error("Failed to fetch posts:", error));
  }, [userId]);
  //URL imagenes post
  function isAbsoluteURL(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  // Funcion likes
  const handleLike = async (postId: number, hasLiked: boolean) => {
    try {
      const url = hasLiked
        ? `${API_BASE_URL}/api/likes/unlike`
        : `${API_BASE_URL}/api/likes/like`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          postId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar posts
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
                        post.user.avatar?.avatar
                          ? `${API_BASE_URL}/${post.user.avatar.avatar}`
                          : man_avatar_2
                      }
                      alt="Avatar"
                      width="30"
                      height="30"
                      className="rounded-circle me-2"
                    />
                    <h2>{post.user.username}</h2>
                  </div>
                  {post.cont_media && (
                    <img
                      src={
                        isAbsoluteURL(post.cont_media)
                          ? post.cont_media
                          : `${API_BASE_URL}/${post.cont_media}`
                      }
                      alt="Post"
                      className={styles.postImage}
                    />
                  )}
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
