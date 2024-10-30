// Announcements.jsx
import React, { useState, useEffect } from 'react';
import './Announcements.css';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Importa ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de toast

// Importa la URL base de tu archivo .env
const API_URL = import.meta.env.VITE_API_URL;

export function Announcements() {

  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementDate, setAnnouncementDate] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, isStaff, logout, isOwner, isSecretary } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 6; // Cambia este valor para mostrar más o menos anuncios por página
  const navigate = useNavigate();

  // Configura la URL base para Axios
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/sentirseBien/api/v1/announcements/');
      setAnnouncements(response.data);
    } catch (error) {
      setError('Error al cargar los anuncios');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const announcementData = {
      title: announcementTitle,
      content: announcementContent,
      date_description: announcementDate,
    };

    try {
      const response = await axios.post('/sentirseBien/api/v1/announcements/', announcementData);
      setAnnouncements([response.data, ...announcements]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementDate('');
      toast.success('Anuncio creado!');
    } catch (error) {
      setError('Error al crear el anuncio');
      console.log(announcementData);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await axios.delete(`/sentirseBien/api/v1/announcements/${id}/`);
      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      toast.success('Anuncio Eliminado!');
    } catch (error) {
      setError('Error al eliminar el anuncio');
    }
  };

  // Configuración de interceptores de Axios
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axios.post('/sentirseBien/api/v1/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', response.data.access);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  // Pagination logic
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

  const totalPages = Math.ceil(announcements.length / announcementsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="announcements-page">
      <div >
        <div>
        <h2 className="announcements-title" style={{ textAlign: 'center' }}>Anuncios Importantes</h2>
        </div>
        

        {error && <p className="error-message">{error}</p>}

        {/* Mostrar los anuncios paginados */}
        <div className="announcements-container">
          {currentAnnouncements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-description">{announcement.content}</p>
              <p className="announcement-date">{announcement.date_description}</p>
              { (isOwner || isSecretary) && <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="delete-button" style={{backgroundColor: 'red'}}>Eliminar</button>}
            </div>
          ))}
        </div>

        {/* Controles de paginación */}
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Siguiente</button>
        </div>

        {/* Formulario para crear anuncios */}
        {(isOwner || isSecretary) && (
          <form className="announcement-form" onSubmit={handleAnnouncementSubmit}>
          <input
            type="text"
            placeholder="Título del anuncio"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Contenido del anuncio"
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Descripción de fechas"
            value={announcementDate}
            onChange={(e) => setAnnouncementDate(e.target.value)}
            required
          />
          <button type="submit">Crear Anuncio</button>
        </form>
        )}
      </div>
    </div>
  );
}
