// Torneos.tsx

import React, { useState, useEffect } from "react";
import styles from "./components/Torneos.module.css";
import espadas from "./components/img/espadas.png";
import defaultAvatar from "./components/img/avatars/default_avatar.png";
import { useNavigate } from "react-router-dom";

interface User {
  id_usuario: number;
  username: string;
  avatar: string | null;
}

interface Tournament {
  id_tournament: number;
  creator_id: number;
  bet_amount: number;
  start_date: string;
  end_date: string;
  status: string;
}

const Torneos = () => {
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(
    null
  );
  const [participants, setParticipants] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [hasPendingInvitation, setHasPendingInvitation] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const userIdString = localStorage.getItem("user_id");
  const navigate = useNavigate();

  if (!userIdString) {
    console.error("User ID is null or undefined");
    return <div>Error: Usuario no autenticado</div>;
  }
  const userId = parseInt(userIdString, 10);

  useEffect(() => {
    // Obtener torneo activo
    fetch(`${API_BASE_URL}/api/tournaments/active/${userId}`)
      .then((response) => {
        if (response.status === 404) {
          // No hay torneo activo
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setActiveTournament(data.tournament);
          setParticipants(data.participants);
        }
      })
      .catch((error) =>
        console.error("Error fetching active tournament:", error)
      );

    // Obtener invitaciones pendientes
    fetch(`${API_BASE_URL}/api/tournaments/invitations/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setHasPendingInvitation(true);
        }
        setInvitations(data);
      })
      .catch((error) =>
        console.error("Error fetching tournament invitations:", error)
      );
  }, [userId]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search/users?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id_usuario === user.id_usuario)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userIdToRemove: number) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user.id_usuario !== userIdToRemove)
    );
  };

  const handleCreateTournament = async () => {
    try {
      const participant_ids = selectedUsers.map((user) => user.id_usuario);
      const response = await fetch(`${API_BASE_URL}/api/tournaments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator_id: userId,
          participant_ids,
          bet_amount: betAmount,
        }),
      });

      if (response.ok) {
        alert("Torneo creado y solicitudes enviadas");
        setWaitingForResponse(true);
      } else {
        const data = await response.json();
        alert(`Error al crear el torneo: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  const handleAcceptInvitation = async (tournamentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          tournament_id: tournamentId,
        }),
      });

      if (response.ok) {
        alert("Has aceptado la invitación al torneo.");
        // Actualizar el estado después de aceptar
        setHasPendingInvitation(false);
        // Redireccionar o actualizar la vista según sea necesario
        navigate(0); // Recarga la página
      } else {
        const data = await response.json();
        alert(`Error al aceptar la invitación: ${data.message}`);
      }
    } catch (error) {
      console.error("Error accepting tournament invitation:", error);
    }
  };

  const handleRejectInvitation = async (tournamentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          tournament_id: tournamentId,
        }),
      });

      if (response.ok) {
        alert("Has rechazado la invitación al torneo.");
        // Actualizar el estado después de rechazar
        setHasPendingInvitation(false);
        // Redireccionar o actualizar la vista según sea necesario
        navigate(0); // Recarga la página
      } else {
        const data = await response.json();
        alert(`Error al rechazar la invitación: ${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting tournament invitation:", error);
    }
  };

  return (
    <div className={styles.torneos}>
      <div className={styles.backgroundContainer}>
        <div className={styles.centeredContainer}>
          <section className={styles.torneosBanner}>
            <h2>Torneo Semanal</h2>
            <img className={styles.tournlogo} src={espadas} alt="Torneo Logo" />
          </section>
          {activeTournament ? (
            <section className={styles.activeTournament}>
              <h3>Torneo Activo</h3>
              <p>Apuesta: {activeTournament.bet_amount} XP</p>
              <p>
                Fecha de inicio:{" "}
                {new Date(activeTournament.start_date).toLocaleDateString()}
              </p>
              <p>
                Fecha de fin:{" "}
                {new Date(activeTournament.end_date).toLocaleDateString()}
              </p>
              <h4>Participantes:</h4>
              <ul>
                {participants.map((participant) => (
                  <li key={participant.id_usuario}>
                    <img
                      src={
                        participant.avatar
                          ? `${API_BASE_URL}/${participant.avatar}`
                          : defaultAvatar
                      }
                      alt={`${participant.username} Avatar`}
                      width="30"
                      height="30"
                    />
                    {participant.username}
                  </li>
                ))}
              </ul>
            </section>
          ) : hasPendingInvitation ? (
            <section className={styles.pendingInvitation}>
              <h3>Invitación al Torneo</h3>
              {invitations.map((invitation) => (
                <div key={invitation.tournament_id}>
                  <p>
                    Has sido invitado al torneo por {invitation.creatorUsername}{" "}
                    (Apuesta: {invitation.bet_amount} XP)
                  </p>
                  <button
                    onClick={() =>
                      handleAcceptInvitation(invitation.tournament_id)
                    }
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() =>
                      handleRejectInvitation(invitation.tournament_id)
                    }
                  >
                    Rechazar
                  </button>
                </div>
              ))}
            </section>
          ) : waitingForResponse ? (
            <section className={styles.waitingResponse}>
              <p>Esperando respuesta de los participantes...</p>
            </section>
          ) : (
            <section className={styles.createTournament}>
              <h3>Crear Torneo</h3>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Buscar usuarios"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Buscar</button>
              </form>
              <div className={styles.searchResults}>
                {searchResults.map((user) => (
                  <div key={user.id_usuario} className={styles.userItem}>
                    <img
                      src={
                        user.avatar
                          ? `${API_BASE_URL}/${user.avatar}`
                          : defaultAvatar
                      }
                      alt={`${user.username} Avatar`}
                      width="30"
                      height="30"
                    />
                    <p>{user.username}</p>
                    <button onClick={() => handleSelectUser(user)}>
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.selectedUsers}>
                <h4>Usuarios seleccionados:</h4>
                {selectedUsers.map((user) => (
                  <div key={user.id_usuario} className={styles.userItem}>
                    <img
                      src={
                        user.avatar
                          ? `${API_BASE_URL}/${user.avatar}`
                          : defaultAvatar
                      }
                      alt={`${user.username} Avatar`}
                      width="30"
                      height="30"
                    />
                    <p>{user.username}</p>
                    <button onClick={() => handleRemoveUser(user.id_usuario)}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.betAmount}>
                <label htmlFor="betAmount">Monto de la apuesta (XP):</label>
                <input
                  type="number"
                  id="betAmount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
                />
              </div>
              <button onClick={handleCreateTournament}>Crear Torneo</button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Torneos;
