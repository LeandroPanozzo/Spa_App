// HomeScreen.js
import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext'; // Asegúrate de que la ruta sea correcta
import { useNavigation } from '@react-navigation/native'; // Importa useNavigation

const inicioImage = require('./img/InicioSecionUsuario.jpg');

const HomeScreen = () => {
  const { user, logout } = useAuth(); // Desestructura user y logout del contexto de autenticación
  const navigation = useNavigation(); // Inicializa useNavigation

  return (
    <View style={styles.container}>
      <ImageBackground
        source={inicioImage}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {user ? ( // Si hay un usuario logueado
          <>
            <Text style={styles.title}>Bienvenido, {user.username}!</Text>
            <TouchableOpacity style={styles.button} onPress={logout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonContainer}>
            <Text style={styles.subtitle}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Inicia sesión</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>¿No te has registrado?</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.buttonText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
