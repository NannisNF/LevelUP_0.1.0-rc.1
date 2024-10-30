/* AvatarForm.tsx */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AvatarForm.module.css";
import man_avatar_1 from "./img/avatars/man_avatar_1.png";
import man_avatar_2 from "./img/avatars/man_avatar_2.png";
import man_avatar_3 from "./img/avatars/man_avatar_3.png";
import man_avatar_4 from "./img/avatars/man_avatar_4.png";
import man_avatar_5 from "./img/avatars/man_avatar_5.png";
import woman_avatar_1 from "./img/avatars/woman_avatar_1.png";
import woman_avatar_2 from "./img/avatars/woman_avatar_2.png";
import woman_avatar_3 from "./img/avatars/woman_avatar_3.png";
import woman_avatar_4 from "./img/avatars/woman_avatar_4.png";
import woman_avatar_5 from "./img/avatars/woman_avatar_5.png";

interface Avatar {
  id: number;
  name: string;
  imageUrl: string;
}

const maleAvatars: Avatar[] = [
  { id: 2, name: "Yeager", imageUrl: man_avatar_1 },
  { id: 3, name: "De Grantaine", imageUrl: man_avatar_2 },
  { id: 4, name: "Avdol", imageUrl: man_avatar_3 },
  { id: 5, name: "Trengsin", imageUrl: man_avatar_4 },
  { id: 6, name: "Draugluin", imageUrl: man_avatar_5 },
];

const femaleAvatars: Avatar[] = [
  { id: 7, name: "Ackerman", imageUrl: woman_avatar_1 },
  { id: 8, name: "Atreides", imageUrl: woman_avatar_2 },
  { id: 9, name: "Nefertari", imageUrl: woman_avatar_3 },
  { id: 10, name: "Duarte", imageUrl: woman_avatar_4 },
  { id: 11, name: "Lycaona", imageUrl: woman_avatar_5 },
];

interface AvatarFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  };
}

function AvatarForm({ formData }: AvatarFormProps) {
  const [showMaleAvatars, setShowMaleAvatars] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const navigate = useNavigate();

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const toggleAvatars = () => {
    setShowMaleAvatars(!showMaleAvatars);
  };

  const handleConfirmAvatar = async () => {
    if (selectedAvatar) {
      try {
        const response = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_user: formData.firstName,
            apellido_user: formData.lastName,
            email: formData.email,
            username: formData.username,
            pass: formData.password,
            uid_avatar: selectedAvatar.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Error en el registro.");
        }

        const data = await response.json();
        console.log("Registro exitoso:", data);

        localStorage.setItem("nombre_user", data.nombre_user);
        localStorage.setItem("apellido_user", data.apellido_user);
        localStorage.setItem("avatar_url", data.avatar);
        localStorage.setItem("username", data.username);
        localStorage.setItem("user_id", data.id);

        navigate("/perfil");
      } catch (error) {
        console.error("Error durante el registro:", error);
        alert("Ocurrió un error al registrar el usuario, intenta nuevamente.");
      }
    } else {
      alert("Por favor selecciona un avatar");
    }
  };

  return (
    <div className={styles.avatarBox}>
      <h2 className={styles.title}>Elige tu personaje</h2>
      <div className={styles.avatarGrid}>
        {(showMaleAvatars ? maleAvatars : femaleAvatars).map((avatar) => (
          <div key={avatar.id} className={styles.cardA}>
            <div
              className={`${styles.avatarCard} ${
                selectedAvatar?.id === avatar.id ? styles.avatarSelected : ""
              }`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <img src={avatar.imageUrl} alt={avatar.name} />
              <h5 className={styles.cardName}>{avatar.name}</h5>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonsAvatar}>
        <button className={styles.buttonAvatar} onClick={toggleAvatars}>
          {showMaleAvatars ? "Mujeres" : "Hombres"}
        </button>

        <button
          className={styles.buttonAvatar}
          onClick={handleConfirmAvatar}
          disabled={!selectedAvatar}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default AvatarForm;
