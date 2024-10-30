import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import './Header.css'; // Asegúrate de crear y enlazar un archivo CSS
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Importa el hook de autenticación
import logo from '../pages/img/logo.jpeg';

export function CustomHeader() {
  const { isAuthenticated, logout, user } = useAuth(); // Obtén el estado de autenticación y el usuario

  const navigate = useNavigate(); // Crea una instancia de navigate
  const [username, setUsername] = useState(null); // Estado local para el username
  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  const handleLogout = () => {
    logout(); // Llama a la función de cierre de sesión
    navigate("/"); // Redirige a la página principal
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Si el usuario está autenticado, actualizamos el username
      if (user && user.username) {
        setUsername(user.username);
      } else {
        setUsername(null); // Si el user es undefined o null, ponemos username en null
      }
      setIsLoading(false); // Ya no estamos en "cargando"
    } else {
      setUsername(null); // Si no está autenticado, ponemos username en null
      setIsLoading(false); // También dejamos de mostrar "Cargando..."
    }
  }, [isAuthenticated, user]);

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-left">
          <div className="logo"> 
            Sentirse Bien
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <div className="nav-right">
          {isLoading ? ( // Mientras estamos cargando
            <span className="logo">Cargando...</span>
          ) : isAuthenticated ? ( // Si el usuario está autenticado
            <>
              <span className="logo">Bienvenido, {username}</span>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : ( // Si no está autenticado
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <div className="section-links">
        <div className="nav-center">
          {/* Puedes agregar más enlaces aquí si lo necesitas */}
        </div>
      </div>
    </header>
  );
}
