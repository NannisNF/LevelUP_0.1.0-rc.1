/* App.tsx */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import NavagationBar from "./components/NavagationBar";
import Inicio from "./Inicio";
import Muro from "./Muro";
import Perfil from "./Perfil";
import Habitos from "./Habitos";
import Torneos from "./Torneos";
import Cuenta from "./Cuenta";
import PostFormPage from "./PostFormPage";
import PerfilExternal from "./PerfilExternal";
import Ganar from "./components/Ganar";
import Perder from "./components/Perder";
import FinHabit from "./components/finHabit";
import Empatar from "./components/Empatar";
import NextLevel from "./components/nextLevel";
import styles from "./components/App.module.css";

function AppContent() {
  const location = useLocation();
  const isInicio = location.pathname === "/" || location.pathname === "/Inicio";

  return (
    <div className="App">
      {isInicio ? <NavBar /> : <NavagationBar />}
      <div
        className={
          isInicio
            ? styles.mainBackgroundContainer
            : styles.backgroundContainerDashboard
        }
      >
        <div className={styles.centeredContainer}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/Inicio" element={<Inicio />} />
            <Route path="/muro" element={<Muro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/perder" element={<Perder />} />
            <Route path="/ganar" element={<Ganar />} />
            <Route path="/empatar" element={<Empatar />} />
            <Route path="/finHabit" element={<FinHabit />} />
            <Route path="/nextLevel" element={<NextLevel />} />
            <Route path="/crear-publicacion" element={<PostFormPage />} />
            <Route
              path="/PerfilExternal/:userId"
              element={<PerfilExternal />}
            />
          </Routes>
        </div>
      </div>
      {isInicio && (
        <footer>
          <section>
            <a href="/Inicio">Ir al comienzo</a>
            <br />
            <a href="mailto:alannis.perez7472@alumnos.udg.mx">
              alannis.perez7472@alumnos.udg.mx
            </a>
          </section>
          <p>Proyecto Modular 2024</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
