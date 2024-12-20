import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./components/Torneos.module.css";
import espadas from "./components/img/espadas.png";
import man_avatar_2 from "./components/img/avatars/man_avatar_2.png";

interface User {
  id_usuario: number;
  username: string | null;
  avatar: {
    avatar: string;
  } | null;
}

interface Participant {
  id_usuario: number;
  username: string;
  avatar: string | null;
  status: string; // Agregamos el status del participante
}

function Torneos() {
  const [view, setView] = useState("initial");
  const [search, setSearch] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [activeTournament, setActiveTournament] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const userId = localStorage.getItem("user_id");
  const userUsername = localStorage.getItem("username");
  const userAvatar = localStorage.getItem("avatar_url");

  if (!userId) {
    console.error("User ID is null");
    return <div>Error: Usuario no autenticado</div>;
  }

  const fetchActiveTournament = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/tournaments/active/${userId}`
      );
      setActiveTournament(response.data.tournament);
      setParticipants(response.data.participants);

      // Ajustar la vista según el estado del torneo y del participante
      const tournamentStatus = response.data.tournament.status;
      const participantStatus = response.data.participantStatus;

      if (participantStatus === "pending") {
        // El usuario tiene una invitación pendiente
        setView("invitationPending");
      } else if (participantStatus === "accepted") {
        if (tournamentStatus === "pending") {
          // El usuario ya aceptó, pero el torneo aún está pendiente
          setView("waiting");
        } else if (tournamentStatus === "active") {
          // El torneo está activo
          setView("participants");
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setView("initial");
        console.error(
          "No tienes torneos activos o pendientes:",
          error.response?.data?.message
        );
      } else {
        console.error("Error desconocido:", error);
      }
    }
  };

  useEffect(() => {
    fetchActiveTournament();
  }, [userId]);

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

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/friends/${userId}/searchAvailable/${search}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching friends", error);
    }
  };

  const handleSelectUser = (user: User) => {
    if (selectedParticipants.length >= 4) {
      alert("No puedes seleccionar más de 4 usuarios");
      return;
    }

    if (
      !selectedParticipants.find(
        (participant) => participant.id_usuario === user.id_usuario
      )
    ) {
      setSelectedParticipants([...selectedParticipants, user]);
    }
  };

  const handleRemoveParticipant = (userId: number) => {
    setSelectedParticipants(
      selectedParticipants.filter((p) => p.id_usuario !== userId)
    );
  };

  const handleConfirm = async () => {
    const participantIds = selectedParticipants.map((p) => p.id_usuario);
    const betAmount = 400;

    try {
      setWaitingForResponse(true); // Cambiar a estado de espera
      await axios.post(`${API_BASE_URL}/api/tournaments/create`, {
        creator_id: parseInt(userId, 10),
        participant_ids: participantIds,
        bet_amount: betAmount,
      });

      const creator = {
        id_usuario: parseInt(userId, 10),
        username: userUsername,
        avatar: userAvatar ? { avatar: userAvatar } : null,
      };

      setSelectedParticipants([creator, ...selectedParticipants]);

      setView("waiting"); // Cambiar vista a esperando respuesta
    } catch (error) {
      console.error("Error al crear el torneo:", error);
    } finally {
      setWaitingForResponse(false); // Resetear el estado de espera
    }
  };

  // Funciones para aceptar o rechazar la invitación
  const handleAcceptTournament = async (tournamentId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/api/tournaments/accept`, {
        user_id: parseInt(userId, 10),
        tournament_id: tournamentId,
      });
      // Actualizar el estado después de aceptar
      fetchActiveTournament();
    } catch (error) {
      console.error("Error al aceptar la invitación al torneo:", error);
    }
  };

  const handleRejectTournament = async (tournamentId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/api/tournaments/reject`, {
        user_id: parseInt(userId, 10),
        tournament_id: tournamentId,
      });
      // Actualizar el estado después de rechazar
      setView("initial");
    } catch (error) {
      console.error("Error al rechazar la invitación al torneo:", error);
    }
  };

  return (
    <div className={styles.torneo}>
      <div className={styles.backgroundContainerTorneo}>
        <div className={styles.centeredContainerTorneo}>
          <section className={styles.containerTorneo}>
            {view === "initial" && (
              <>
                <article className={styles.torneosBanner}>
                  <h2>Torneo Semanal</h2>
                  <img
                    className={styles.tournlogo}
                    src={espadas}
                    alt="Torneo Logo"
                  />
                </article>
                <article className={styles.crearTorneoContainer}>
                  <button onClick={() => setView("invite")}>
                    Crear Torneo
                  </button>
                </article>
              </>
            )}

            {view === "invite" && (
              <article className={styles.inviteContainer}>
                <h2>Invitar usuarios</h2>
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  className={styles.searchBar}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search.trim() && (
                  <ul className={styles.searchResults}>
                    {results.map((user) => (
                      <li
                        key={user.id_usuario}
                        onClick={() => handleSelectUser(user)}
                        className={styles.searchResultItem}
                      >
                        <img
                          src={
                            user.avatar
                              ? `${API_BASE_URL}/${user.avatar.avatar}`
                              : man_avatar_2
                          }
                          alt="Avatar"
                          width="30"
                          height="30"
                          className="rounded-circle me-2"
                        />
                        {user.username}
                      </li>
                    ))}
                  </ul>
                )}
                <div className={styles.selectedParticipants}>
                  <h3>Participantes seleccionados:</h3>
                  {selectedParticipants.map((user) => (
                    <div
                      key={user.id_usuario}
                      className={styles.participantItem}
                    >
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
                      {user.username}
                      {user.id_usuario !== parseInt(userId, 10) && (
                        <button
                          onClick={() =>
                            handleRemoveParticipant(user.id_usuario)
                          }
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={
                    selectedParticipants.length === 0 || waitingForResponse
                  }
                >
                  {waitingForResponse ? "Enviando..." : "Confirmar"}
                </button>
              </article>
            )}

            {view === "invitationPending" && (
              <div>
                <section className={styles.torneosBanner}>
                  <h2>Torneo Semanal</h2>
                  <img
                    className={styles.tournlogo}
                    src={espadas}
                    alt="Torneo Logo"
                  />
                </section>
                <section className={styles.waitingContainer}>
                  <h2>Tienes una invitación al torneo</h2>
                  <button
                    onClick={() =>
                      handleAcceptTournament(activeTournament.id_tournament)
                    }
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() =>
                      handleRejectTournament(activeTournament.id_tournament)
                    }
                  >
                    Rechazar
                  </button>
                </section>
              </div>
            )}

            {view === "waiting" && (
              <div>
                <section className={styles.torneosBanner}>
                  <h2>Torneo Semanal</h2>
                  <img
                    className={styles.tournlogo}
                    src={espadas}
                    alt="Torneo Logo"
                  />
                </section>
                <section className={styles.waitingContainer}>
                  <h2>Esperando respuesta de los participantes...</h2>
                  <div className={styles.participantsList}>
                    {participants.map((participant) => (
                      <div
                        key={participant.id_usuario}
                        className={styles.participante}
                      >
                        <img
                          src={
                            participant.avatar
                              ? `${API_BASE_URL}/${participant.avatar}`
                              : man_avatar_2
                          }
                          alt={`${participant.username} Avatar`}
                          className={styles.avatar}
                        />
                        <p>{participant.username}</p>
                        <p>
                          {participant.status === "accepted"
                            ? "-  Aceptado"
                            : "-  Pendiente"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {view === "participants" && activeTournament && (
              <>
                <section className={styles.torneosBanner}>
                  <h2>Torneo Semanal</h2>
                  <img
                    className={styles.tournlogo}
                    src={espadas}
                    alt="Torneo Logo"
                  />
                </section>
                <section className={styles.participantesContainer}>
                  <h2>Participantes</h2>
                  <div className={styles.participantsList}>
                    {participants.map((participant) => (
                      <div
                        key={participant.id_usuario}
                        className={styles.participante}
                      >
                        <img
                          src={
                            participant.avatar
                              ? `${API_BASE_URL}/${participant.avatar}`
                              : man_avatar_2
                          }
                          alt={`${participant.username} Avatar`}
                          className={styles.avatar}
                        />
                        <p>{participant.username}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Torneos;
