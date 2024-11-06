import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./components/Cuenta.module.css";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

interface Friend {
  id_usuario: number;
  avatar: string | null;
  username: string;
}

function Cuenta() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const avatarUrl = localStorage.getItem("avatar_url");
  const userId = localStorage.getItem("user_id");
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
    username: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!userId) {
      console.error("El userId es inválido");
      navigate("/Inicio");
      return;
    }
    // Obtener información del usuario
    fetch(`${API_BASE_URL}/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          nombre: data.nombre_user,
          apellido: data.apellido_user,
          username: data.username,
        });
      })
      .catch((err) => console.error(err));
  }, [userId]);

  const handleDeleteFriend = (id: number) => {
    const confirmation = window.confirm(
      "¿Estás seguro de eliminar a este amigo?"
    );
    if (confirmation) {
      fetch(`${API_BASE_URL}/api/friends/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: parseInt(userId!, 10), friendId: id }),
      })
        .then((res) => {
          if (res.ok) {
            setFriends(friends.filter((friend) => friend.id_usuario !== id));
          } else {
            alert("Error al eliminar al amigo");
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleAmigosClick = () => {
    if (!userId) {
      console.error("El userId es inválido");
      return;
    }

    // Obtener lista de amigos
    fetch(`${API_BASE_URL}/api/friends/${userId}/list`)
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
    // Limpiar localStorage y redirigir a pagina principal
    localStorage.clear();
    navigate("/Inicio");
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userInfo.nombre || !userInfo.apellido || !userInfo.username) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const updatedInfo = {
      nombre_user: userInfo.nombre,
      apellido_user: userInfo.apellido,
      username: userInfo.username,
      ...(newPassword && { pass: newPassword }),
    };

    fetch(`${API_BASE_URL}/api/users/update/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedInfo),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then(({ status, body }) => {
        if (status >= 200 && status < 300) {
          alert("Información actualizada con éxito");
          setIsEditingProfile(false);
        } else {
          alert(`Error al actualizar la información: ${body.message}`);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.cuenta}>
      <div className={styles.backgroundContainerAccount}>
        <div className={styles.centeredContainerAccount}>
          <div className={styles.avatarContainer}>
            <img
              src={avatarUrl ? `${API_BASE_URL}/${avatarUrl}` : man_avatar_2}
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
                      src={
                        friend.avatar
                          ? `${API_BASE_URL}/${friend.avatar}`
                          : man_avatar_2
                      }
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

          {/* Mostrar formulario para editar informacionde usuario */}
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
