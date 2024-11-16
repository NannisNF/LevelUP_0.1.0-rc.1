import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";
import AddFriendButton from "./components/AddFriendButton";
import styles from "./components/Perfil.module.css";

type FriendAction = "add" | "accept" | "reject" | "remove";

interface Post {
  id_publicacion: number;
  cont_media: string | null;
  cont_text: string | null;
  hasLiked: boolean;
  likesCount: number;
}

interface User {
  avatar: string | null;
  nombre_user: string;
  apellido_user: string;
  username: string;
  nivel_user: number;
}
const PerfilExternal = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState("none");
  const [isReceiver, setIsReceiver] = useState(false);
  const myIdString = localStorage.getItem("user_id");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!myIdString) {
    console.error("User ID is null");
    return <div>Error: Usuario no autenticado</div>;
  }

  const myId = parseInt(myIdString, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          console.error("User ID from params is undefined");
          return;
        }

        const parsedUserId = parseInt(userId, 10);

        if (isNaN(parsedUserId) || isNaN(myId)) {
          throw new Error("IDs de usuario inválidos");
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        // Obtener info del usuario
        const userResponse = await fetch(
          `${API_BASE_URL}/api/users/${parsedUserId}`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUser(userData);

        // Obtener publicaciones del usuario con likes
        const postsResponse = await fetch(
          `${API_BASE_URL}/api/posts/user/${parsedUserId}/withLikes?myId=${myId}`
        );
        if (!postsResponse.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsResponse.json();
        setPosts(postsData);

        // Obtener estado de amistad
        const statusResponse = await fetch(
          `${API_BASE_URL}/api/friends/status/${myId}/${parsedUserId}`
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
  //URL imagenes post
  function isAbsoluteURL(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }
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
          userId: myId,
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

  const handleFriendAction = async (action: FriendAction) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      if (!userId) {
        console.error("User ID from params is undefined");
        return;
      }

      let url = "";
      let method = "POST";
      let body = {};

      if (action === "add") {
        url = `${API_BASE_URL}/api/friends/add`;
        body = {
          id_user1: myId, // Tu ID (solicitante)
          id_user2: parseInt(userId, 10), // ID del otro usuario (receptor)
        };
      } else if (action === "accept" || action === "reject") {
        url = `${API_BASE_URL}/api/friends/${action}`;
        body = {
          id_user1: parseInt(userId, 10), // ID del solicitante original
          id_user2: myId, // Tu ID (receptor que acepta/rechaza)
        };
      } else if (action === "remove") {
        url = `${API_BASE_URL}/api/friends/delete`;
        body = {
          userId: myId,
          friendId: parseInt(userId, 10),
        };
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar estado amistad
        if (action === "add") {
          setFriendshipStatus("pending");
          setIsReceiver(false);
        } else if (action === "accept") {
          setFriendshipStatus("accepted");
        } else if (action === "reject") {
          setFriendshipStatus("none");
        } else if (action === "remove") {
          setFriendshipStatus("none");
        }
      } else {
        console.error("Error en la acción de amistad:", data.message);
      }
    } catch (error) {
      console.error("Error en la acción de amistad:", error);
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
              {/* Botones de amistad uwu */}
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
              {friendshipStatus === "accepted" && (
                <button onClick={() => handleFriendAction("remove")}>
                  Eliminar Amigo
                </button>
              )}
              {friendshipStatus === "rejected" && (
                <button onClick={() => handleFriendAction("add")}>
                  Enviar Nueva Solicitud
                </button>
              )}
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default PerfilExternal;
