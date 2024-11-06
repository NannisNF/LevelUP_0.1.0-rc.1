import { useState, useEffect } from "react";
import styles from "./components/Perfil.module.css";
import PostButton from "./components/PostButton";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

interface Post {
  id_publicacion: number;
  cont_media: string | null;
  cont_text: string | null;
  hasLiked: boolean;
  likesCount: number;
}

interface UserDetails {
  nombre_user: string;
  apellido_user: string;
  username: string;
  avatar: string | null;
  nivel_user: number;
  porcentaje_progreso: number;
}

const Perfil = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const userId = localStorage.getItem("user_id");

  if (!userId) {
    console.error("User ID is null");
    return <div>Error: Usuario no autenticado</div>;
  }

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Obtener publicaciones del usuario con likes
    fetch(`${API_BASE_URL}/api/posts/user/${userId}/withLikes?myId=${userId}`)
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Failed to fetch posts:", error));

    // Obtener info con nivel y progreso de usuari principal
    fetch(`${API_BASE_URL}/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUserDetails(data))
      .catch((error) => console.error("Failed to fetch user details:", error));
  }, [userId]);

  // Likes
  const handleLike = async (postId: number, hasLiked: boolean) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const url = hasLiked
        ? `${API_BASE_URL}/api/likes/unlike`
        : `${API_BASE_URL}/api/likes/like`;

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

  if (!userDetails) {
    return <div>Cargando...</div>;
  }

  const {
    nombre_user,
    apellido_user,
    username,
    avatar,
    nivel_user,
    porcentaje_progreso,
  } = userDetails;

  // Definir API_BASE_URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className={styles.perfil}>
      <div className={styles.profileBackgroundContainer}>
        <section className={styles.profileContainer}>
          <div className={styles.profileSidebar}>
            <div className={styles.profileAvatar}>
              <img
                src={avatar ? `${API_BASE_URL}/${avatar}` : man_avatar_2}
                alt="Usuario Avatar"
              />
              <h2>
                {nombre_user} {apellido_user}
              </h2>
              <p>@{username}</p>
              <p>Nivel {nivel_user}</p>
              <div className={styles.levelBar}>
                <div
                  className={styles.levelProgress}
                  style={{ width: `${porcentaje_progreso}%` }}
                ></div>
              </div>
              <p>{porcentaje_progreso.toFixed(2)}% </p>
            </div>
          </div>
          <div className={styles.profilePosts}>
            <PostButton>Crear Publicación</PostButton>
            <div className={styles.postsContainer}>
              {posts.map((post) => (
                <article
                  key={post.id_publicacion}
                  className={styles.profileDashboardPosts}
                >
                  {post.cont_media && (
                    <img
                      src={`${API_BASE_URL}/${post.cont_media}`}
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Perfil;
