import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from './config';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [cuit, setCuit] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'El correo electrónico no tiene un formato válido');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/register/`, {
        username,
        first_name,
        last_name,
        cuit,
        email,
        password,
        confirm_password: confirmPassword,
      });

      // Almacenar tokens
      await AsyncStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh);
      }

      // Configurar axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Realizar login
      await login();

      // Navegar a la pantalla de inicio
      navigation.navigate('Home');

      Toast.show({
        type: 'success',
        text1: 'Usuario creado exitosamente!',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error en el registro:', error.response?.data || error.message);
      let errorMessage = 'Hubo un error en el registro';

      if (error.response?.data) {
        const errors = error.response.data;

        if (errors.username) {
          errorMessage = 'El nombre de usuario ya está en uso.';
        } else if (errors.email) {
          errorMessage = 'El correo electrónico ya está en uso.';
        } else if (errors.cuit) {
          errorMessage = 'El CUIT debe ser exactamente 11 dígitos numéricos.';
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombres"
        value={first_name}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={last_name}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="CUIT"
        value={cuit}
        onChangeText={setCuit}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f7f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RegisterScreen;

