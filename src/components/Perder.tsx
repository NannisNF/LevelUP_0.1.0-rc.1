//Perder.tsx
import { useState, useEffect } from "react";
import espadas from "./img/espadas.png";
import styles from "./Perder.module.css";
import lossImage from "./img/loss.png";
const Perder = () => {
  return (
    <div
      className={styles.perder}
      style={{ backgroundImage: `url(${lossImage})` }}
    >
      <div className={styles.perderBanner}>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
        <h2>¡Has perdido!</h2>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
      </div>
      <div className={styles.perderLeyenda}>
        <p>
          Parece que esta no fue tu semana, pero recuerda que siempre puedes
          volver a intentarlo y mejorar. Tus esfuerzos valdrán la pena.
        </p>
      </div>
    </div>
  );
};

export default Perder;
