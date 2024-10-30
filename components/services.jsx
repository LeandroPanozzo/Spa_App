
import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './services.css';
import fisioterapiaImage from '../pages/img/fisioterapiaImage.jpg';
import masajesImage from '../pages/img/masajesImage.jpg';
import tratamientoFacialImage from '../pages/img/tratamientoFacialImage.jpg';
import packCompletoImage from '../pages/img/packCompletoImage.jpg';
import servicioImage from '../pages/img/servicios_img.jpg';

export function Services() {
  return (
    <div className="services-page">
      <div 
        className="service-header" 
        style={{
          backgroundImage: `url(${servicioImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          height: '400px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'column', 
          color: '#fff',
          textShadow: '0 0 5px rgba(0, 0, 0, 0.5)', 
          padding: '20px',
          marginTop: '-50px',
        }}
      >
        <h1 className="lead text-center" style={{ fontSize: '3rem', color: '#fff', textShadow: '0 0 5px rgba(0, 0, 0, 0.5)' }}>Nuestros Servicios</h1>
        <p className="parrafo-bienestar text-center" style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 0 5px rgba(0, 0, 0, 0.5)', maxWidth: '600px' }}>
          En Sentirse Bien Spa, ofrecemos una amplia gama de servicios diseñados para rejuvenecer su cuerpo y mente. 
          Nuestro equipo de expertos está dedicado a proporcionar una experiencia relajante y revitalizante.
        </p>
      </div>

      <div className="services-grid" style={{ padding: '50px' }}>
        <ServiceCard 
          image={fisioterapiaImage}
          title="Fisioterapia"
          description="Nuestros fisioterapeutas expertos utilizan técnicas avanzadas para aliviar el dolor, mejorar la movilidad y promover la curación."
          price="Desde $60 por sesión"
        />
        <ServiceCard 
          image={masajesImage}
          title="Masajes"
          description="Disfrute de una variedad de técnicas de masaje, desde relajantes hasta terapéuticos, para aliviar la tensión y el estrés."
          price="Desde $80 por 60 minutos"
        />
        <ServiceCard 
          image={tratamientoFacialImage}
          title="Tratamiento Facial"
          description="Rejuvenezca su piel con nuestros tratamientos faciales personalizados, utilizando productos de alta calidad."
          price="Desde $90 por tratamiento"
        />
        <ServiceCard 
          image={packCompletoImage}
          title="Pack Completo"
          description="Experimente lo mejor de nuestro spa con un paquete completo que incluye masaje, tratamiento facial y más."
          price="Desde $200 por paquete"
        />
      </div>
    </div>
  );
}

function ServiceCard({ image, title, description, price }) {
  const navigate = useNavigate(); 

  const handleBookNowClick = () => {
    navigate('/login'); 
  };

  return (
    <div className="service-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
      <img src={image} alt={title} className="service-image" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} />
      <div className="service-content" style={{ padding: '20px' }}>
        <h2 className="service-title" style={{ fontSize: '2rem' }}>{title}</h2>
        <p className="service-description" style={{ fontSize: '1.2rem' }}>{description}</p>
        <p className="service-price" style={{ fontSize: '1.5rem' }}>{price}</p>
        <button className="book-button" onClick={handleBookNowClick} style={{ backgroundColor: '#ff7f8a', color: '#fff', padding: '10px 20px', borderRadius: '5px', border: 'none' }}>Reservar ahora</button>
      </div>
    </div>
  );
}
