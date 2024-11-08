import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from './config'; // Importa desde config.js
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const checkConfiguration = () => {
    if (!API_URL) {
      Alert.alert(
        'Error de Configuración',
        'La URL de la API no está configurada correctamente. Por favor, contacte al administrador.'
      );
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    if (!checkConfiguration()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Iniciando solicitud de login a:', `${API_URL}/sentirseBien/api/v1/token/`);
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/token/`, {
        username: username.trim(),
        password: password.trim(),
      });

      if (!response.data || !response.data.access) {
        throw new Error('Respuesta del servidor inválida: falta token de acceso');
      }

      // Almacenar los tokens
      await AsyncStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Solicitar los detalles del usuario
      const userDetailsResponse = await axios.get(`${API_URL}/sentirseBien/api/v1/user/`);
      const userDetails = userDetailsResponse.data;
      if (Array.isArray(userDetails) && userDetails.length > 0) {
        const userDetail = userDetails[0];
        if (userDetail.is_owner || userDetail.is_professional || userDetail.is_secretary) {
          Alert.alert('Acceso Denegado', 'Su cuenta no tiene permiso para iniciar sesión.');
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          return;
        }
      }

      // Continuar con el inicio de sesión
      await login();
      navigation.navigate('Home');
      Toast.show({
        type: 'success',
        text1: '¡Bienvenido!',
        text2: 'Inicio de sesión exitoso',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error completo:', {
        message: error.message,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : 'No response',
        request: error.request ? 'Request exists' : 'No request'
      });

      let errorMessage = 'Error al iniciar sesión';

      if (!API_URL) {
        errorMessage = 'Error de configuración: API_URL no definida';
      } else if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Datos de inicio de sesión inválidos';
            break;
          case 401:
            errorMessage = 'Usuario o contraseña incorrectos';
            break;
          case 404:
            errorMessage = 'Servicio no disponible';
            break;
          case 500:
            errorMessage = 'Error en el servidor';
            break;
          default:
            errorMessage = error.response.data?.detail || 'Error desconocido';
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  debugInfo: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 30,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LoginScreen;
