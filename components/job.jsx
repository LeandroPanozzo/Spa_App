import React from 'react';
import './job.css';

export function Job() {
    return (
        <div className="job-page">
            <div>

                    <div className="hero-section" style={{
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          height: '100vh', 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'column',
          backgroundRepeat: 'no-repeat',
        }}>
                        <h1 className="lead">ÚNETE A NUESTRO EQUIPO</h1>
                        <p className="parrafo-bienestar text-center" style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 0 5px rgba(0, 0, 0, 0.5)', maxWidth: '600px' }}>Estamos buscando profesionales apasionados para unirse a nuestra clínica de masajes.</p>
                    </div>
                <div className="container">
                    <h2 className="text-center mb-4">Oportunidades de Empleo</h2>
                    <div className="job-description">
                        <h3>Aptitudes y Estudios Requeridos:</h3>
                        <ul>
                            <li>Título en Fisioterapia o Masoterapia</li>
                            <li>Experiencia mínima de 2 años en masajes terapéuticos</li>
                            <li>Conocimiento en técnicas de relajación y rehabilitación</li>
                            <li>Excelentes habilidades de comunicación y atención al cliente</li>
                            <li>Capacidad para trabajar en equipo</li>
                        </ul>
                    </div>
                    <div className="application-section">
                        <h3>¿Interesado en unirte a nosotros?</h3>
                        <p>Envía tu currículum a: <a href="mailto:empleos@clinicademasajes.com">empleos@clinicademasajes.com</a></p>
                    </div>
                    <div className="button-container">
                        <a href="mailto:empleos@clinicademasajes.com" className="btn-apply">Enviar CV</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
