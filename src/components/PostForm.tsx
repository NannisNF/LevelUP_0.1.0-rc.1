//PostForm.tsx
import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";

// Definición de la interfaz para el tipo Habit
interface Habit {
  id_habito: number;
  titulo: string;
}

const PostForm = ({ onClose }: { onClose: () => void }) => {
  const [habit, setHabit] = useState<string>(""); // Usar string inicialmente porque se guarda el ID como string en el value del select
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]); // Inicializar como array vacío

  // El hook useEffect para cargar los hábitos
  useEffect(() => {
    const fetchHabits = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return; // Verifica que realmente haya un user_id

      try {
        const response = await fetch(
          `http://localhost:3000/api/habits/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch habits");
        }
        const data: Habit[] = await response.json();
        setHabits(data); // Actualiza el estado de habits con los datos obtenidos
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, []); // Dependencias vacías para que solo se ejecute una vez al montar el componente

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    if (image) {
      formData.append("cont_media", image);
    }
    formData.append("cont_text", description);
    formData.append("post_hid", habit);
    formData.append("uid_post", localStorage.getItem("user_id")!);
    formData.append("post_date", new Date().toISOString().slice(0, 10));

    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const responseData = await response.json();
      console.log("Post creado:", responseData);
      onClose(); // Cerrar el formulario después de enviar
    } catch (error) {
      console.error("Error posting new post:", error);
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
