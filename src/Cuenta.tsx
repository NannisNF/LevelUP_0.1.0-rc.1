import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./components/Cuenta.module.css";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

function Cuenta() {
  const avatarUrl = localStorage.getItem("avatar_url");
  const userId = localStorage.getItem("user_id");
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
    username: "",
    pass: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Obtener información del usuario
    fetch(`http://localhost:3000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          nombre: data.nombre_user,
          apellido: data.apellido_user,
          username: data.username,
          pass: "••••••••",
        });
      })
      .catch((err) => console.error(err));
  }, [userId]);

  const handleDeleteFriend = (id) => {
    const confirmation = window.confirm(
      "¿Estás seguro de eliminar a este amigo?"
    );
    if (confirmation) {
      fetch(`http://localhost:3000/api/friends/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, friendId: id }),
      })
        .then((res) => {
          if (res.ok) {
            setFriends(friends.filter((friend) => friend.id !== id));
          } else {
            alert("Error al eliminar al amigo");
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleAmigosClick = () => {
    // Verifica que userId es válido
    if (!userId) {
      console.error("El userId es inválido");
      return;
    }

    // Obtener lista de amigos
    fetch(`http://localhost:3000/api/friends/${userId}/list`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Error en la solicitud: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => setFriends(data))
      .catch((err) =>
        console.error("Error al obtener la lista de amigos:", err)
      );
    setShowFriendsList(true);
  };

  const handleBackClick = () => {
    setShowFriendsList(false);
    setIsEditingProfile(false);
  };

  const handleSalirClick = () => {
    navigate("/Inicio");
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    // Aquí iría la lógica para guardar la nueva información
    const updatedInfo = {
      nombre_user: userInfo.nombre,
      apellido_user: userInfo.apellido,
      username: userInfo.username,
      pass: newPassword || userInfo.pass, // Si no se cambió la contraseña
    };
    fetch(`http://localhost:3000/api/users/update/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedInfo),
    })
      .then((res) => {
        if (res.ok) {
          alert("Información actualizada con éxito");
          setIsEditingProfile(false);
        } else {
          alert("Error al actualizar la información");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleProfileChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.cuenta}>
      <div className={styles.backgroundContainerAccount}>
        <div className={styles.centeredContainerAccount}>
          <div className={styles.avatarContainer}>
            <img
              src={avatarUrl || man_avatar_2}
              className={styles.avatarCuenta}
              alt="Usuario Avatar"
            />
          </div>

          {/* Mostrar botones principales si no estamos en amigos ni editando perfil */}
          {!showFriendsList && !isEditingProfile && (
            <div className={styles.buttonsContainer}>
              <button onClick={handleSalirClick}>Salir</button>
              <button onClick={handleEditProfile}>Configuración</button>
              <button onClick={handleAmigosClick}>Amigos</button>
            </div>
          )}

          {/* Mostrar lista de amigos */}
          {showFriendsList && (
            <div className={styles.friendsListContainer}>
              <button className={styles.backButton} onClick={handleBackClick}>
                Regresar
              </button>
              <h2>Amigos</h2>
              <div className={styles.friendsList}>
                {friends.map((friend) => (
                  <div key={friend.id_usuario} className={styles.friendItem}>
                    <img
                      src={friend.avatar || man_avatar_2} // Asegúrate de usar la URL correcta del avatar del amigo
                      alt="Avatar del amigo"
                      className={styles.friendAvatar}
                    />
                    <span className={styles.friendUsername}>
                      {friend.username}
                    </span>
                    <button
                      onClick={() => handleDeleteFriend(friend.id_usuario)}
                      className={styles.deleteFriendButton}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar formulario de edición de perfil */}
          {isEditingProfile && (
            <form
              onSubmit={handleSaveProfile}
              className={styles.editProfileForm}
            >
              <h2>Configuración</h2>
              <div className={styles.formRow}>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={userInfo.nombre}
                  onChange={handleProfileChange}
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={userInfo.apellido}
                  onChange={handleProfileChange}
                />
              </div>
              <div className={styles.formRow}>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={userInfo.username}
                  onChange={handleProfileChange}
                />
              </div>
              <div className={styles.formRow}>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className={styles.saveButton}>
                  Guardar
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsEditingProfile(false)}
                >
                  Regresar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cuenta;
