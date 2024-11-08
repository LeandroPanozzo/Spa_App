import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Toast } from 'react-native-toast-message'; // Asegúrate de tener react-native-toast-message instalado
import { useAuth } from './AuthContext';
import { API_URL } from './config'; // Importa la URL de configuración
import AsyncStorage from '@react-native-async-storage/async-storage';

export function UserEdit() {
    const [formData, setFormData] = useState({
        cuit: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setError('');
        try {
            const response = await axios.get(`${API_URL}/sentirseBien/api/v1/user/update/`);
            setFormData({
                cuit: response.data.cuit,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
                password: '',
                confirmPassword: '',
            });
        } catch {
            console.error("Error details:", error); // Log para más detalles
            setError('Error al cargar los datos del usuario');
        }
    };

    // Configuración de interceptores de axios
    axios.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('access_token'); // Cambiado a AsyncStorage
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
                    const refreshToken = await AsyncStorage.getItem('refresh_token'); // Cambiado a AsyncStorage
                    const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
                    await AsyncStorage.setItem('access_token', response.data.access); // Cambiado a AsyncStorage
                    return axios(originalRequest);
                } catch {
                    logout();
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );

    const handleChange = (name, value) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const { confirmPassword, ...dataToUpdate } = formData;

        if (!formData.password) {
            delete dataToUpdate.password;
        } else {
            dataToUpdate.password = formData.password;
        }

        try {
            await axios.put(`${API_URL}/sentirseBien/api/v1/user/update/`, dataToUpdate);
            Toast.show({ text1: 'Información actualizada con éxito.' });
        } catch {
            setError('Hubo un error al actualizar la información.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Editar Perfil</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TextInput
                style={styles.input}
                placeholder="CUIT"
                value={formData.cuit}
                onChangeText={(value) => handleChange('cuit', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={formData.first_name}
                onChangeText={(value) => handleChange('first_name', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={formData.last_name}
                onChangeText={(value) => handleChange('last_name', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={formData.password}
                secureTextEntry
                onChangeText={(value) => handleChange('password', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                value={formData.confirmPassword}
                secureTextEntry
                onChangeText={(value) => handleChange('confirmPassword', value)}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonContainer}>Guardar cambios</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#f1f1f1',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#ff7f8a',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    buttonContainer: {
        padding: 8,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#28a745',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },
});

export default UserEdit;
