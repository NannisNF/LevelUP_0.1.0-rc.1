import { useState, useEffect } from "react";
import espadas from "./img/espadas.png";
import levelUpImage from "./img/userLevelUP.png";
import styles from "./nextLevel.module.css";

const NextLevel = () => {
  const [level, setLevel] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const levelParam = queryParams.get("level");
    if (levelParam) {
      setLevel(levelParam);
    }
  }, []);

  return (
    <div
      className={styles.nextLevel}
      style={{ backgroundImage: `url(${levelUpImage})` }}
    >
      <div className={styles.nextLevelBanner}>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
        <h2>¡Felicidades!</h2>
        <h3>Has subido de nivel {level}</h3>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
      </div>
      <div className={styles.nextLevelLeyenda}>
        <p>¡Sigue esforzándote y alcanza nuevas metas!</p>
      </div>
    </div>
  );
};

export default NextLevel;
