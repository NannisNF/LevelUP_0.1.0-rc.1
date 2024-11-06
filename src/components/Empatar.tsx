// Empatar.tsx
import espadas from "./img/espadas.png";
import tieImage from "./img/tie.png";
import styles from "./Empatar.module.css";

const Empatar = () => {
  return (
    <div
      className={styles.empatar}
      style={{ backgroundImage: `url(${tieImage})` }}
    >
      <div className={styles.empatarBanner}>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
        <h2>¡Empate!</h2>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
      </div>
      <div className={styles.empatarLeyenda}>
        <p>
          Tú y tu oponente lo han hecho muy bien. Sigan así y un día serán
          vencedores.
        </p>
      </div>
    </div>
  );
};

export default Empatar;
