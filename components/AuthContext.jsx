import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Asegúrate de tener jwt-decode instalado
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage

// Configura la URL base de tu API
const API_URL = import.meta.env.VITE_API_URL;

// Crear el contexto
const AuthContext = createContext();

// Proveedor de autenticación
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isStaff, setIsStaff] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isProfessional, setIsProfessional] = useState(false);
    const [isSecretary, setIsSecretary] = useState(false);

    // Configura la URL base para Axios
    axios.defaults.baseURL = API_URL;

    // Función para manejar el login
    const login = async () => {
        setIsAuthenticated(true);
        await checkUserRole();
    };

    // Función para manejar el logout
    const logout = async () => {
        // Remover los tokens de AsyncStorage
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);
        setIsStaff(false);
        setIsOwner(false);
        setIsProfessional(false);
        setIsSecretary(false);
    };

    // Función para verificar el rol del usuario (Owner, Staff, Professional, Secretary)
    const checkUserRole = async () => {
        try {
            // Obtén el token de acceso de AsyncStorage
            const accessToken = await AsyncStorage.getItem('access_token');
            if (accessToken) {
                // Decodifica el token para obtener el payload
                const decodedToken = jwtDecode(accessToken);
                const userId = decodedToken.user_id; // Asegúrate de que 'user_id' es el campo correcto en tu payload

                // Realiza la solicitud para obtener los detalles del usuario
                const response = await axios.get(`/sentirseBien/users/${userId}/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}` // Incluye el token de acceso en los encabezados
                    }
                });
                
                // Guarda el usuario en el estado
                setUser(response.data);
                setIsStaff(response.data.is_staff);
                setIsOwner(response.data.is_owner);
                setIsProfessional(response.data.is_professional);
                setIsSecretary(response.data.is_secretary);
                console.log('User Role:', response.data);
            } else {
                throw new Error('Token no encontrado');
            }
        } catch (error) {
            console.error('Error al verificar el rol del usuario', error);
        }
    };

    // Efecto para verificar autenticación al cargar la aplicación
    useEffect(() => {
        const checkToken = async () => {
            const accessToken = await AsyncStorage.getItem('access_token');
            if (accessToken) {
                // Si hay un token, configurar Axios y setear la autenticación
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                setIsAuthenticated(true);
                await checkUserRole();
            }
            setLoading(false); // Una vez terminada la verificación, desactivar la carga
        };

        checkToken();
    }, []); // Ejecutar solo al montar el componente

    if (loading) {
        return null; // Retorna null mientras se carga para evitar parpadeos
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            logout, 
            isStaff, 
            isOwner, 
            isProfessional, 
            isSecretary 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
    return useContext(AuthContext);
}
