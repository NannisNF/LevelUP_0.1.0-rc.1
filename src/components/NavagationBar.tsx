// NavagationBar.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import man_avatar_2 from "./img/avatars/man_avatar_2.png";
import carta from "./img/carta.png";
import minilogo from "./img/minilogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link } from "react-router-dom";
import styles from "./NavagationBar.module.css"; // Importa el módulo CSS

function NavagationBar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const avatarUrl = localStorage.getItem("avatar_url");

  // Estados
  const [friendRequests, setFriendRequests] = useState([]);
  const [tournamentInvitations, setTournamentInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Cálculo del total de notificaciones
  const totalNotifications =
    friendRequests.length + tournamentInvitations.length + notifications.length;
  const searchContainerRef = useRef(null);
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

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

  // useEffect para solicitudes de amistad
  useEffect(() => {
    const fetchFriendRequests = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:3000/api/friends/requests/${userId}`
        );
        if (response.data) {
          setFriendRequests(response.data);
        }
      } catch (error) {
        console.error("Error fetching friend requests", error);
      }
    };

    fetchFriendRequests();
  }, []);

  // Funciones para aceptar/rechazar invitaciones a torneos
  const fetchTournamentInvitations = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/tournaments/invitations/${userId}`
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
  }, []);

  const handleAcceptTournament = async (tournamentId) => {
    const userId = localStorage.getItem("user_id");
    try {
      await axios.post("http://localhost:3000/api/tournaments/accept", {
        user_id: userId,
        tournament_id: tournamentId,
      });
      // Actualizar las invitaciones
      fetchTournamentInvitations();
    } catch (error) {
      console.error("Error accepting tournament invitation", error);
    }
  };

  const handleRejectTournament = async (tournamentId) => {
    const userId = localStorage.getItem("user_id");
    try {
      await axios.post("http://localhost:3000/api/tournaments/reject", {
        user_id: userId,
        tournament_id: tournamentId,
      });
      // Actualizar las invitaciones
      fetchTournamentInvitations();
    } catch (error) {
      console.error("Error rejecting tournament invitation", error);
    }
  };

  const fetchResults = async () => {
    const userId = localStorage.getItem("user_id");
    console.log("Fetching results for user:", userId);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/search/users?name=${search}&iuserId=${userId}`
      );
      console.log("Results:", response.data);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:3000/api/notifications/${userId}`
        );
        if (response.data) {
          // Si 'data' es un string JSON, parsearlo
          const parsedNotifications = response.data.map((notif) => ({
            ...notif,
            data:
              typeof notif.data === "string"
                ? JSON.parse(notif.data)
                : notif.data,
          }));
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    const { type, data } = notification;
    if (type === "tournament_result") {
      if (data.result === "win") {
        window.open("/Ganar", "_blank");
      } else if (data.result === "lose") {
        window.open("/Perder", "_blank");
      } else if (data.result === "tie") {
        window.open("/Empatar", "_blank");
      }
    } else if (type === "habit_completed") {
      window.open("/finHabit", "_blank");
    } else if (type === "level_up") {
      window.open("/nextLevel", "_blank"); // Redirige a la nueva ventana
    }

    try {
      await axios.put(
        `http://localhost:3000/api/notifications/read/${notification.id_notification}`
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
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
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
        <a className={styles.brandNav} href="http://localhost:5173/Muro">
          <img
            src={minilogo}
            alt="Logo"
            width="30"
            className="d-inline-block align-text-top"
          />
          LevelUP
        </a>

        <div
          className="d-flex mx-auto"
          style={{ width: "50%", position: "relative" }}
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
              {results.map((user, index) => (
                <li key={index} className={styles.searchResultItem}>
                  <img
                    src={user.avatar?.avatar || man_avatar_2}
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
                        src={invitation.creatorAvatar || man_avatar_2}
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
                src={avatarUrl || man_avatar_2}
                alt="Avatar"
                width="40"
                height="40"
                className="rounded-circle"
              />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  href="http://localhost:5173/Perfil"
                >
                  Perfil
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  href="http://localhost:5173/Muro"
                >
                  Muro
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  href="http://localhost:5173/Torneos"
                >
                  Torneos
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  href="http://localhost:5173/Habitos"
                >
                  Mis hábitos
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${styles.customDropdownItem}`}
                  href="http://localhost:5173/Cuenta"
                >
                  Cuenta
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavagationBar;
