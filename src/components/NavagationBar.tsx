// NavagationBar.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import man_avatar_2 from "./img/avatars/man_avatar_2.png";
import carta from "./img/carta.png";
import minilogo from "./img/minilogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NavagationBar.module.css";
interface Notification {
  id_notification: number;
  message: string;
  data: any;
  type: string;
}
interface User {
  id_usuario: number;
  username: string;
  avatar: {
    avatar: string;
  } | null;
}

interface FriendRequest {
  id_amistad: number;
  senderId: number;
  senderUsername: string;
}

interface TournamentInvitation {
  tournament_id: number;
  creatorAvatar: string | null;
  creatorUsername: string;
}

function NavagationBar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [search, setSearch] = useState("");
  const avatarUrl = localStorage.getItem("avatar_url");
  const navigate = useNavigate();

  // Estados
  const [results, setResults] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [tournamentInvitations, setTournamentInvitations] = useState<
    TournamentInvitation[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cálculo del total de notificaciones
  const totalNotifications =
    friendRequests.length + tournamentInvitations.length + notifications.length;

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        fetchResults();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!userId) return;
      try {
        const response = await axios.get<FriendRequest[]>(
          `${API_BASE_URL}/api/friends/requests/${userId}`
        );
        if (response.data) {
          setFriendRequests(response.data);
        }
      } catch (error) {
        console.error("Error fetching friend requests", error);
      }
    };

    fetchFriendRequests();
  }, [API_BASE_URL, userId]);

  const fetchTournamentInvitations = async () => {
    if (!userId) return;
    try {
      const response = await axios.get<TournamentInvitation[]>(
        `${API_BASE_URL}/api/tournaments/invitations/${userId}`
      );
      if (response.data) {
        setTournamentInvitations(response.data);
      }
    } catch (error) {
      console.error("Error fetching tournament invitations", error);
    }
  };

  useEffect(() => {
    fetchTournamentInvitations();
  }, [API_BASE_URL, userId]);

  const handleAcceptTournament = async (tournamentId: number) => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE_URL}/api/tournaments/accept`, {
        user_id: userId,
        tournament_id: tournamentId,
      });
      // Actualizar las invitaciones
      fetchTournamentInvitations();
    } catch (error) {
      console.error("Error accepting tournament invitation", error);
      alert("Error al aceptar la invitación al torneo.");
    }
  };

  const handleRejectTournament = async (tournamentId: number) => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE_URL}/api/tournaments/reject`, {
        user_id: userId,
        tournament_id: tournamentId,
      });
      // Actualizar las invitaciones
      fetchTournamentInvitations();
    } catch (error) {
      console.error("Error rejecting tournament invitation", error);
      alert("Error al rechazar la invitación al torneo.");
    }
  };

  const fetchResults = async () => {
    if (!userId) return;
    try {
      const response = await axios.get<User[]>(
        `${API_BASE_URL}/api/search/users?name=${search}&iuserId=${userId}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const response = await axios.get<Notification[]>(
          `${API_BASE_URL}/api/notifications/${userId}`
        );
        if (response.data) {
          const parsedNotifications = response.data.map(
            (notif: Notification) => ({
              ...notif,
              data:
                typeof notif.data === "string"
                  ? JSON.parse(notif.data)
                  : notif.data,
            })
          );
          console.log("Notificaciones recibidas:", parsedNotifications);
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, [API_BASE_URL, userId]);

  const handleNotificationClick = async (notification: Notification) => {
    const { type, data } = notification;
    if (type === "tournament_result") {
      if (data.result === "win") {
        navigate("/Ganar");
      } else if (data.result === "lose") {
        navigate("/Perder");
      } else if (data.result === "draw") {
        navigate("/Empatar");
      }
    } else if (type === "habit_completed") {
      navigate("/finHabit");
    } else if (type === "level_up") {
      navigate("/nextLevel");
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/read/${notification.id_notification}`
      );
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (n) => n.id_notification !== notification.id_notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={styles.navbarCustom}>
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ width: "100%" }}
      >
        <Link className={styles.brandNav} to="/Muro">
          <img
            src={minilogo}
            alt="Logo"
            width="30"
            className="d-inline-block align-text-top"
          />
          LevelUP
        </Link>

        <div
          className={`d-flex mx-auto ${styles.searchContainer}`}
          ref={searchContainerRef}
        >
          <input
            className="form-control me-2"
            type="search"
            placeholder="Buscar"
            aria-label="Search"
            value={search}
            onChange={handleSearchChange}
          />
          {search.trim() && results.length > 0 && (
            <ul className={styles.searchResults}>
              {results.map((user) => (
                <li key={user.id_usuario} className={styles.searchResultItem}>
                  <img
                    src={
                      user.avatar?.avatar
                        ? `${API_BASE_URL}/${user.avatar.avatar}`
                        : man_avatar_2
                    }
                    alt="Avatar"
                    width="30"
                    height="30"
                    className="rounded-circle me-2"
                  />
                  <Link to={`/PerfilExternal/${user.id_usuario}`}>
                    {user.username}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dropdown para notificaciones */}
        <div className="d-flex align-items-center">
          <div className="dropdown me-3">
            <button
              className="dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <img
                src={carta}
                alt="Notificaciones"
                width="30"
                className="d-inline-block align-text-top"
              />
              {totalNotifications > 0 && (
                <span className="badge bg-danger">{totalNotifications}</span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              {/* Notificaciones generales */}
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <li
                    key={`notification-${notification.id_notification}`}
                    className="dropdown-item"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.message}
                  </li>
                ))
              ) : (
                <li className="dropdown-item text-center">
                  No tienes nuevas notificaciones
                </li>
              )}

              {/* Separador */}
              <hr className="dropdown-divider" />

              {/* Solicitudes de amistad */}
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <li key={`friend-request-${request.id_amistad}`}>
                    <Link
                      className="dropdown-item"
                      to={`/PerfilExternal/${request.senderId}`}
                    >
                      Nueva solicitud de amistad de {request.senderUsername}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item">
                    No tienes solicitudes pendientes
                  </span>
                </li>
              )}

              {/* Separador */}
              <hr className="dropdown-divider" />

              {/* Invitaciones a torneos */}
              {tournamentInvitations.length > 0 ? (
                tournamentInvitations.map((invitation) => (
                  <li
                    key={`tournament-${invitation.tournament_id}`}
                    className="dropdown-item"
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={
                          invitation.creatorAvatar
                            ? `${API_BASE_URL}/${invitation.creatorAvatar}`
                            : man_avatar_2
                        }
                        alt="Avatar"
                        width="30"
                        height="30"
                        className="rounded-circle me-2"
                      />
                      <div>
                        <span className="fw-bold">
                          {invitation.creatorUsername}
                        </span>
                        <div>
                          Te ha invitado al torneo #{invitation.tournament_id}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() =>
                          handleAcceptTournament(invitation.tournament_id)
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() =>
                          handleRejectTournament(invitation.tournament_id)
                        }
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="dropdown-item text-center">
                  No tienes invitaciones a torneos
                </li>
              )}
            </ul>
          </div>

          {/* Dropdown para la imagen del avatar */}
          <div className="dropdown">
            <button
              className="dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <img
                src={avatarUrl ? `${API_BASE_URL}/${avatarUrl}` : man_avatar_2}
                alt="Avatar"
                width="40"
                height="40"
                className="rounded-circle"
              />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  to="/Perfil"
                >
                  Perfil
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  to="/Muro"
                >
                  Muro
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  to="/Torneos"
                >
                  Torneos
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  to="/Habitos"
                >
                  Mis hábitos
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  to="/Cuenta"
                >
                  Cuenta
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavagationBar;
