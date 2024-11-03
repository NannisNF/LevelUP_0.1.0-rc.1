// PostForm.tsx
import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";

interface Habit {
  id_habito: number;
  titulo: string;
}

const PostForm = ({ onClose }: { onClose: () => void }) => {
  const [habit, setHabit] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchHabits = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("El ID de usuario no está disponible en localStorage");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/habits/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch habits");
        }
        const data: Habit[] = await response.json();
        setHabits(data);
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, [API_BASE_URL]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!habit) {
      alert("Por favor, selecciona un hábito.");
      return;
    }

    if (!description.trim()) {
      alert("Por favor, ingresa una descripción.");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert(
        "No se encontró el ID de usuario. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    const formData = new FormData();
    if (image) {
      formData.append("cont_media", image);
    }
    formData.append("cont_text", description);
    formData.append("post_hid", habit);
    formData.append("uid_post", userId);
    formData.append("post_date", new Date().toISOString().slice(0, 10));

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const responseData = await response.json();
      console.log("Post creado:", responseData);

      // Limpiar el formulario después de enviar
      setHabit("");
      setDescription("");
      setImage(null);
      onClose();
    } catch (error) {
      console.error("Error al crear la publicación:", error);
      alert(
        "Ocurrió un error al crear la publicación. Por favor, inténtalo nuevamente."
      );
    }
  };

  return (
    <div className={styles.postFormContainer}>
      <form onSubmit={handleSubmit} className={styles.postForm}>
        <div className={styles.formSection}>
          <label htmlFor="habit-select">Hábito:</label>
          <select
            id="habit-select"
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
          >
            <option value="">Selecciona un hábito</option>
            {habits.map((h) => (
              <option key={h.id_habito} value={h.id_habito}>
                {h.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formSection}>
          <label htmlFor="image-upload">Imagen:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>
        <div className={styles.formSection}>
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.formButtons}>
          <button type="submit" className={styles.saveButton}>
            Guardar
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
