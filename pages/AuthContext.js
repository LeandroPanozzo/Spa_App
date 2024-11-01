import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

const parseJWT = (token) => {
  const payload = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload;
};

const isValidJWT = (token) => {
  if (!token) return false;

  try {
    const decoded = parseJWT(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    console.log('Error al decodificar token:', error);
    return false;
  }
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  axios.defaults.baseURL = API_URL;

  const login = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token || !isValidJWT(token)) {
        throw new Error('Token inválido');
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      await checkUserExistence();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error de autenticación',
        text2: error.message || 'Hubo un problema al iniciar sesión',
      });
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No hay token de refresco');

      const response = await axios.post(`/auth/refresh/`, { refresh: refreshToken });
      await AsyncStorage.setItem('access_token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      logout();
    }
  };

  const checkUserExistence = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token || !isValidJWT(token)) {
        throw new Error('Token inválido o no encontrado');
      }

      const decoded = parseJWT(token);
      const userId = decoded.user_id;

      const response = await axios.get(`/sentirseBien/users/${userId}/`);
      setUser(response.data);
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      logout();
      setError('Error al verificar usuario');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token && isValidJWT(token)) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
          await checkUserExistence();
        } else {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            await refreshAuthToken();
          }
        }
      } catch (error) {
        console.error('Error durante la verificación de autenticación:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (loading) {
    return null; // Puedes cambiar esto por un componente de carga
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
