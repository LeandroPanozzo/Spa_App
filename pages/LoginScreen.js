import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
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
    console.log('Verificando configuración...');
    console.log('API_URL:', API_URL);
    
    if (!API_URL) {
      console.error('API_URL no está configurada');
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

      await AsyncStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh);
      }

      const storedToken = await AsyncStorage.getItem('access_token');
      if (!storedToken) {
        throw new Error('Error al almacenar el token');
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

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
      {__DEV__ && (
        <Text style={styles.debugInfo}>API URL: {API_URL}</Text>
      )}
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
      <Button
        title={isLoading ? "Cargando..." : "Iniciar Sesión"}
        onPress={handleLogin}
        disabled={isLoading}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default LoginScreen;
