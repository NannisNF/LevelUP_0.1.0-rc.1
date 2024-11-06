import espadas from "./img/espadas.png";
import finHabit from "./img/finHabit.png";
import styles from "./finHabit.module.css";

const FinHabit = () => {
  return (
    <div
      className={styles.finHabit}
      style={{ backgroundImage: `url(${finHabit})` }}
    >
      <div className={styles.finHabitBanner}>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
        <h2>¡Hábito Completado!</h2>
        <img src={espadas} alt="Espadas" className={styles.espadasIcon} />
      </div>
      <div className={styles.finHabitLeyenda}>
        <p>
          No hay plazo que no se cumpla, ni día que no llegue. Has dado tu mejor
          esfuerzo y este siempre te dara los frutos merecidos.
        </p>
        <p>¡Felicidades y sigue mejorando!</p>
      </div>
    </div>
  );
};

export default FinHabit;
