// Habitos.tsx
import { useEffect, useState } from "react";
import styles from "./components/Habits.module.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Habitos() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [view, setView] = useState("habitList");
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classHabit, setClassHabit] = useState("1");
  const [xpHabit, setXpHabit] = useState("750");
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID is null or undefined");
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/habits/user/${userId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch habits: ${response.statusText}`);
        }
        const data = await response.json();
        setHabits(data);
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, []);

  const handleAddHabit = () => {
    setShowForm(true);
    setView("addHabit");
  };

  const handleSelectHabit = (habit) => {
    setSelectedHabit(habit);
    setView("habitDetail");
  };

  const handleCloseDetail = () => {
    setSelectedHabit(null);
    setView("habitList");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setView("habitList");
  };

  const handleSaveHabit = async () => {
    const userId = localStorage.getItem("user_id");

    // Validar campos obligatorios
    if (!title || !description || !startDate || !endDate) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validar fechas
    if (new Date(startDate) > new Date(endDate)) {
      alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    const habitData = {
      habit_uid: userId,
      titulo: title,
      descripcion: description,
      inicio_habit: startDate,
      fin_habit: endDate,
      xp_habito: xpHabit,
      clase_habit: classHabit,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habitData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create habit: ${response.statusText}`);
      }
      // Actualizar la lista
      const newHabit = await response.json();
      setHabits([...habits, newHabit]);
      setShowForm(false);
      setView("habitList");
    } catch (error) {
      console.error("Error saving new habit:", error);
    }
  };

  function HabitDetail() {
    if (!selectedHabit) return null;

    const startDate = new Date(selectedHabit.inicio_habit);
    const endDate = new Date(selectedHabit.fin_habit);
    const today = new Date();

    const totalDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const daysElapsed =
      (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const rawPercentage = (daysElapsed / totalDays) * 100;
    const percentage = Math.min(Math.max(rawPercentage, 0), 100);

    const isCompleted =
      percentage >= 100 || selectedHabit.status_habito === "completado";

    return (
      <article className={styles.habitDetail}>
        <h2>{selectedHabit.titulo}</h2>
        <img
          className={styles.classUser}
          src={
            selectedHabit.image
              ? `${API_BASE_URL}/${selectedHabit.image}`
              : "/img/classes/default.jpg"
          }
          alt={selectedHabit.titulo}
        />
        <p>{selectedHabit.descripcion}</p>
        <div style={{ width: 100, height: 100, margin: "auto" }}>
          {isCompleted ? (
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.5em",
              }}
            >
              COMPLETADO
            </p>
          ) : (
            <CircularProgressbar
              value={percentage}
              text={`${Math.round(percentage)}%`}
              styles={buildStyles({
                pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
                textColor: "#333",
                trailColor: "#d6d6d6",
                backgroundColor: "#3e98c7",
              })}
            />
          )}
        </div>
        <div className={styles.buttons}>
          <button>Editar</button>
          <button onClick={handleDeleteHabit}>Eliminar</button>
          <button onClick={handleCloseDetail}>Cerrar</button>
        </div>
      </article>
    );
  }

  const handleDeleteHabit = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de eliminar este hábito?"
    );
    if (confirmation && selectedHabit) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/habits/${selectedHabit.id_habito}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to delete habit: ${response.statusText}`);
        }
        // Actualizar la lista de hábitos
        setHabits(
          habits.filter((habit) => habit.id_habito !== selectedHabit.id_habito)
        );
        setSelectedHabit(null);
        setView("habitList");
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  function handleTitleFocus() {
    fetchRecommendations();
    setShowRecommendations(true);
  }

  function handleTitleBlur() {
    // Retrasar el cierre para permitir que el clic en una recomendación se registre
    setTimeout(() => setShowRecommendations(false), 200);
  }

  async function fetchRecommendations() {
    const userId = localStorage.getItem("user_id");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/habits/recommendations/${userId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch recommendations: ${response.statusText}`
        );
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }

  function handleRecommendationClick(habit) {
    setTitle(habit.titulo);
    setDescription(habit.descripcion);
    setClassHabit(habit.clase_pred_habit.toString());
    setXpHabit(habit.xp_pred_habit.toString());
    setShowRecommendations(false);
  }

  return (
    <div className={styles.habitos}>
      <div className={styles.backgroundContainerHabits}>
        <div className={styles.centeredContainerHabits}>
          <section className={styles.containerHabits}>
            {view === "habitList" && (
              <>
                {habits.length > 0 ? (
                  habits.map((habit) => (
                    <article
                      key={habit.id_habito}
                      className={styles.currentHabit}
                      onClick={() => handleSelectHabit(habit)}
                    >
                      <img
                        className={styles.classUser}
                        src={
                          habit.image
                            ? `${API_BASE_URL}/${habit.image}`
                            : "/img/classes/sabio.jpg"
                        }
                        alt={habit.titulo || "No Title"}
                      />
                      <h2>{habit.titulo || "No Title"}</h2>
                      <p>Puntos de XP: {habit.xp_habito || 0}</p>
                    </article>
                  ))
                ) : (
                  <p>No tienes hábitos en este momento. ¡Crea uno nuevo!</p>
                )}
                <button
                  className={styles.addHabitButton}
                  onClick={handleAddHabit}
                >
                  Agregar Hábito
                </button>
              </>
            )}
            {view === "addHabit" && showForm && (
              <div className={styles.addHabitForm}>
                <input
                  type="text"
                  placeholder="Agregar Título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={handleTitleFocus}
                  onBlur={handleTitleBlur}
                />
                {showRecommendations && recommendations.length > 0 && (
                  <ul className={styles.recommendationsDropdown}>
                    {recommendations.map((habit) => (
                      <li
                        key={habit.id_predeterminado}
                        onClick={() => handleRecommendationClick(habit)}
                      >
                        {habit.titulo}
                      </li>
                    ))}
                  </ul>
                )}

                <textarea
                  placeholder="Agregar Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <label>
                  Inicio del hábito:
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  Fin del hábito:
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
                <label>
                  Clase del hábito:
                  <select
                    value={classHabit}
                    onChange={(e) => setClassHabit(e.target.value)}
                  >
                    <option value="1">Guerrero</option>
                    <option value="2">Sabio</option>
                    <option value="3">Aventurero</option>
                  </select>
                </label>
                <label>
                  Dificultad:
                  <select
                    value={xpHabit}
                    onChange={(e) => setXpHabit(e.target.value)}
                  >
                    <option value="750">Fácil</option>
                    <option value="1300">Normal</option>
                    <option value="3000">Difícil</option>
                  </select>
                </label>
                <div className={styles.formButtons}>
                  <button onClick={handleSaveHabit}>Guardar</button>
                  <button onClick={handleCloseForm}>Cancelar</button>
                </div>
              </div>
            )}
            {view === "habitDetail" && selectedHabit && <HabitDetail />}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Habitos;
