import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Dimensions, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useAuth } from './AuthContext'; // Asegúrate de que la ruta sea correcta
import { useNavigation } from '@react-navigation/native';

const inicioImage = require('./img/InicioSecionProfesional.jpg');
const sobreNosotrosImage = require('./img/SobreNosotros.jpg'); // Asegúrate de agregar esta imagen en tu proyecto

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { height } = useWindowDimensions(); // Usando useWindowDimensions para obtener altura de pantalla

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Imagen de fondo que ocupa toda la pantalla */}
      <ImageBackground
        source={inicioImage}
        style={[styles.imageBackground, { height }]} // Ajustando dinámicamente la altura
        resizeMode="cover"
      >
        {user ? (
          <>
            <Text style={styles.title}>
              ¡Nos alegra tenerte de vuelta, {user.username}! 
            </Text>
            <Text style={styles.subtitle}>
              ¿Listo para tu próxima cita o consulta? Explora nuestros servicios.
            </Text>
            <Text style={styles.subtitle}>
              En tu cuenta, podrás gestionar tus citas, tusy mucho más.
            </Text>
            <TouchableOpacity style={styles.button} onPress={logout} accessibilityLabel="Cerrar sesión">
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonContainer}>
            <Text style={styles.aboutTitle}>
              Únete a nuestra comunidad y empieza tu camino hacia el bienestar. En Sentirse Bien.
            </Text>
            <Text style={styles.subtitle}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')} accessibilityLabel="Iniciar sesión">
              <Text style={styles.buttonText}>Inicia sesión</Text>
            </TouchableOpacity>
            <Text style={styles.aboutTitle}>
              Regístrate ahora para acceder a nuestras promociones exclusivas y programar tu primera cita.
            </Text>
            <Text style={styles.subtitle}>¿No te has registrado?</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')} accessibilityLabel="Registrarse">
              <Text style={styles.buttonText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>

      {/* Sección "Sobre Nosotros" solo para usuarios no registrados */}
      {!user && (
        <ImageBackground
          source={sobreNosotrosImage}
          style={styles.aboutImageBackground}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.aboutTitle}>Sobre Nosotros</Text>
            <Text style={styles.aboutText}>
              Clínica Sentirse Bien tiene una trayectoria de más de 20 años ofreciendo servicios de bienestar y salud a nuestros clientes. Nuestro equipo de profesionales está dedicado a brindar una experiencia personalizada y de calidad, enfocada en el bienestar físico y mental de cada persona que nos visita.
            </Text>
          </View>
        </ImageBackground>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  imageBackground: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 10,
    textShadowColor: 'black',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  aboutImageBackground: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 15,
  },
});

export default HomeScreen;

