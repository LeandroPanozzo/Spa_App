import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from './config'; // Importa desde config.js
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
    <View style={styles.container}>
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
      <Button title="Registrarse" onPress={handleRegister} />
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
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default RegisterScreen;
