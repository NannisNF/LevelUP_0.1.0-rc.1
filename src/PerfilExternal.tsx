import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";
import AddFriendButton from "./components/AddFriendButton";
import styles from "./components/Perfil.module.css";

const PerfilExternal = () => {
  const [posts, setPosts] = useState([]);
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState("none");
  const [isReceiver, setIsReceiver] = useState(false);
  const myIdString = localStorage.getItem("user_id");
  const myId = parseInt(myIdString, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parsedUserId = parseInt(userId, 10);

        if (isNaN(parsedUserId) || isNaN(myId)) {
          throw new Error("IDs de usuario inválidos");
        }

        // Obtener detalles del usuario
        const userResponse = await fetch(
          `http://localhost:3000/api/users/${parsedUserId}`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUser(userData);

        // Obtener publicaciones del usuario con likes
        const postsResponse = await fetch(
          `http://localhost:3000/api/posts/user/${parsedUserId}/withLikes?myId=${myId}`
        );
        if (!postsResponse.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsResponse.json();
        setPosts(postsData);

        // Obtener estado de amistad
        const statusResponse = await fetch(
          `http://localhost:3000/api/friends/status/${myId}/${parsedUserId}`
        );
        if (!statusResponse.ok)
          throw new Error("Failed to fetch friendship status");
        const statusData = await statusResponse.json();
        setFriendshipStatus(statusData.status);
        if (statusData.isReceiver !== undefined) {
          setIsReceiver(statusData.isReceiver);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, myId]);

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
          userId: myId,
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

  if (!user) return <div>Cargando...</div>;

  return (
    <div className={styles.perfilExternal}>
      <div className={styles.backgroundContainerDashboard}>
        <section className={styles.profileContainer}>
          <div className={styles.profileSidebar}>
            <div className={styles.profileAvatar}>
              <img src={user.avatar || man_avatar_2} alt="Usuario Avatar" />
              <h2>
                {user.nombre_user} {user.apellido_user}
              </h2>
              <p>@{user.username}</p>
              <p>Nivel {user.nivel_user}</p>
              {/* Botones de amistad */}
              {friendshipStatus === "none" && (
                <AddFriendButton onClick={() => handleFriendAction("add")}>
                  Agregar Amigo
                </AddFriendButton>
              )}
              {friendshipStatus === "pending" && (
                <>
                  {isReceiver ? (
                    <>
                      <button onClick={() => handleFriendAction("accept")}>
                        Confirmar
                      </button>
                      <button onClick={() => handleFriendAction("reject")}>
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <p>Solicitud de amistad enviada</p>
                  )}
                </>
              )}
              {friendshipStatus === "accepted" && <p>Ya son amigos</p>}
              {friendshipStatus === "rejected" && <p>Solicitud rechazada</p>}
            </div>
          </div>
          <div className={styles.profilePosts}>
            <div className={styles.postsContainer}>
              {posts.map((post) => (
                <article
                  key={post.id_publicacion}
                  className={styles.profileDashboardPosts}
                >
                  {post.cont_media && (
                    <img
                      src={post.cont_media}
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

export default PerfilExternal;
