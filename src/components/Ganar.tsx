//Ganar.tsx

import espadas from "./img/espadas.png";
import winImage from "./img/win.png";
import styles from "./Ganar.module.css";

const Ganar = () => {
  return (
    <div
      className={styles.ganar}
      style={{ backgroundImage: `url(${winImage})` }}
    >
      <div className={styles.ganarBanner}>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
        <h2>¡Has vencido!</h2>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
      </div>
      <div className={styles.ganarLeyenda}>
        <p>
          Eres el vencedor de esta semana, has conseguido una recompensa de:
          1000xp
        </p>
      </div>
    </div>
  );
};

export default Ganar;
