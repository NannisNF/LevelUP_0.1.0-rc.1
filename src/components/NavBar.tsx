/* NavBar.tsx */
import minilogo from "./img/minilogo.png";
import styles from "./NavBar.module.css";

function NavBar() {
  return (
    <nav className={styles.navbarCustom}>
      <div className="container-fluid">
        <a className={styles.brand} href="http://localhost:5173/Inicio">
          <img
            src={minilogo}
            alt="Logo"
            width="30"
            className="d-inline-block align-text-top"
          />
          LevelUP
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
