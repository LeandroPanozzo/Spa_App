import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa'; // Importar íconos
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h2>Sentirse Bien Spa</h2>
          <p>Calle Principal 123, Ciudad</p>
          <p>Teléfono: (123) 456-7890</p>
          <div className="footer-buttons">
            <Link to="/about" className="footer-button">Sobre nosotros</Link>
            <Link to="/contact" className="footer-button">Contáctanos</Link>
          </div>
        </div>

        <div className="footer-map">
          <div dangerouslySetInnerHTML={{ __html: `
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2977.2471506178617!2d-58.9791909870039!3d-27.45171128651721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450da708554127%3A0x42bda46f60e2d142!2sLAVADERO%20AYACUCHO!5e0!3m2!1ses-419!2sar!4v1725749319443!5m2!1ses-419!2sar" width="600" height="200" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          ` }} />
        </div>
      </div>

      <div className="footer-socials">
        <h3>Síguenos en redes sociales</h3>
        <div className="social-icons">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="social-icon" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="social-icon" />
          </a>
        </div>
      </div>

      <div className="footer-copyright">
        <p>Creado por: Grupo 22</p> {/* Añadido aquí */}
        <p>&copy; 2023 Sentirse Bien Spa. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
