/* LogInForm.tsx */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LogInForm.module.css";
import AvatarForm from "./AvatarForm";

function LogInForm() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentView, setCurrentView] = useState<
    "login" | "register" | "avatar"
  >("login");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSignInClick = () => {
    setCurrentView("login");
  };

  const handleSignUpClick = () => {
    setCurrentView("register");
  };

  const handleShowAvatarForm = () => {
    // Validar campos obligatorios
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    setCurrentView("avatar");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!loginUsername || !loginPassword) {
      alert("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Credenciales incorrectas. Por favor, verifica tu usuario y contraseña."
          );
        } else {
          throw new Error(
            "Error en el servidor. Por favor, intenta más tarde."
          );
        }
      }

      const data = await response.json();

      // Verificar que los datos existen antes de almacenarlos
      if (
        data.nombre_user &&
        data.apellido_user &&
        data.avatar &&
        data.username &&
        data.id
      ) {
        localStorage.setItem("nombre_user", data.nombre_user);
        localStorage.setItem("apellido_user", data.apellido_user);
        localStorage.setItem("avatar_url", data.avatar);
        localStorage.setItem("username", data.username);
        localStorage.setItem("user_id", data.id);
      } else {
        throw new Error(
          "Datos del usuario incompletos en la respuesta del servidor."
        );
      }

      console.log("Login successful:", data);

      navigate("/muro");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error durante el inicio de sesión:", error);
        alert(error.message || "Error durante el inicio de sesión");
      } else {
        alert("Error desconocido durante el inicio de sesión");
      }
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {currentView === "login" && (
        <div className={`${styles.containerForm} ${styles.login}`}>
          <div className={styles.information}>
            <div className={styles.infoChilds}>
              <h2>Bienvenido de vuelta</h2>
              <p>Continúa tu travesía y alcanza tus metas</p>
              <input
                type="button"
                value={"Crear Cuenta"}
                id="signUp"
                onClick={handleSignUpClick}
              />
            </div>
          </div>
          <div className={styles.formInformation}>
            <div className={styles.formInformationChilds}>
              <h2>Iniciar Sesión</h2>
              <form onSubmit={handleLogin}>
                <div className="input-group mb-3">
                  <span className="input-group-text" id="basic-addon1">
                    @
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre de usuario"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
                <div className="input-group mb-3">
                  <span
                    className="input-group-text"
                    id="inputGroup-sizing-default"
                  >
                    Contraseña
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    aria-label="Password"
                    aria-describedby="inputGroup-sizing-default"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <input
                  className={styles.logButton}
                  type="submit"
                  value={"Ingresar"}
                />
              </form>
            </div>
          </div>
        </div>
      )}

      {currentView === "register" && (
        <div className={`${styles.containerForm} ${styles.register}`}>
          <div className={styles.information}>
            <div className={styles.infoChilds}>
              <h2>Bienvenido</h2>
              <p>
                Únete a la comunidad y comienza una nueva travesía para alcanzar
                tus metas
              </p>
              <input
                type="button"
                value={"Iniciar sesión"}
                id="signIn"
                onClick={handleSignInClick}
              />
            </div>
          </div>
          <div className={styles.formInformation}>
            <div className={styles.formInformationChilds}>
              <h2>Registrarse</h2>
              <form>
                <div className="input-group">
                  <span className="input-group-text">Nombre y Apellido</span>
                  <input
                    type="text"
                    aria-label="First name"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleRegisterChange}
                  />
                  <input
                    type="text"
                    aria-label="Last name"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleRegisterChange}
                  />
                </div>
                <br />
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Correo electrónico"
                    aria-label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleRegisterChange}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    @ejemplo.com
                  </span>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text" id="basic-addon1">
                    @
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre de usuario"
                    aria-label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text">Contraseña</span>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleRegisterChange}
                  />
                </div>
                <input
                  className={styles.logButton}
                  type="button"
                  value={"Registrarse"}
                  onClick={handleShowAvatarForm}
                />
              </form>
            </div>
          </div>
        </div>
      )}

      {currentView === "avatar" && <AvatarForm formData={formData} />}
    </div>
  );
}

export default LogInForm;
