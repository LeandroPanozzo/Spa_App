import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from './config'; // Importa desde config.js
import Toast from 'react-native-toast-message';

const QueryAndResponseComponent = () => {
  const [queries, setQueries] = useState([]);
  const [responses, setResponses] = useState([]);
  const [newQuery, setNewQuery] = useState({ title: '', content: '' });
  const [newResponse, setNewResponse] = useState({ content: '', query: null });
  const [error, setError] = useState('');
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Por favor, inicia sesión para ver y crear consultas.');
    } else {
      fetchQueries();
      fetchResponses();
    }
  }, [isAuthenticated]);

  // Configuración del interceptor de Axios
  axios.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const fetchQueries = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/queries/`);
      setQueries(response.data);
    } catch (error) {
      setError('Error al cargar las consultas');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al cargar las consultas',
      });
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/responses/`);
      setResponses(response.data);
    } catch (error) {
      setError('Error al cargar las respuestas');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al cargar las respuestas',
      });
    }
  };

  const handleNewQuerySubmit = async () => {
    try {
      await axios.post(`${API_URL}/sentirseBien/api/v1/queries/`, newQuery);
      setNewQuery({ title: '', content: '' });
      fetchQueries();
      Toast.show({
        type: 'success',
        text1: 'Consulta creada!',
      });
    } catch (error) {
      setError('Error al crear la consulta');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al crear la consulta',
      });
    }
  };

  const handleNewResponseSubmit = async (queryId) => {
    try {
      await axios.post(`${API_URL}/sentirseBien/api/v1/responses/`, { ...newResponse, query: queryId });
      setNewResponse({ content: '', query: null });
      fetchResponses();
      Toast.show({
        type: 'success',
        text1: 'Respuesta creada!',
      });
    } catch (error) {
      setError('Error al crear la respuesta');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al crear la respuesta',
      });
    }
  };

  const handleDeleteQuery = async (id) => {
    try {
      await axios.delete(`${API_URL}/sentirseBien/api/v1/queries/${id}/`);
      setQueries(queries.filter(query => query.id !== id));
      Toast.show({
        type: 'success',
        text1: 'Consulta eliminada!',
      });
    } catch (error) {
      setError('Error al eliminar la consulta');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error al eliminar la consulta',
      });
    }
  };

  const renderQueryItem = ({ item }) => {
    const filteredResponses = responses.filter(response => response.query === item.id);
    return (
      <View style={styles.queryCard}>
        <Text style={styles.queryTitle}>Asunto: {item.title}</Text>
        <Text>Por: {item.user.first_name} {item.user.last_name}</Text>
        <Text>{item.content}</Text>
        <Button title="Eliminar" onPress={() => handleDeleteQuery(item.id)} color="red" />
        <TextInput
          style={styles.responseInput}
          placeholder="Tu respuesta"
          value={newResponse.query === item.id ? newResponse.content : ''}
          onChangeText={(text) => setNewResponse({ content: text, query: item.id })}
        />
        <Button title="Responder" onPress={() => handleNewResponseSubmit(item.id)} />
        <View>
          {filteredResponses.map(response => (
            <View key={response.id} style={styles.responseCard}>
              <Text>Respondido por: {response.user.first_name} {response.user.last_name}</Text>
              <Text>{response.content}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return null; // O una pantalla de inicio de sesión
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas y Respuestas</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de la consulta"
        value={newQuery.title}
        onChangeText={(text) => setNewQuery({ ...newQuery, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Contenido de la consulta"
        value={newQuery.content}
        onChangeText={(text) => setNewQuery({ ...newQuery, content: text })}
      />
      <Button title="Crear Consulta" onPress={handleNewQuerySubmit} />
      <FlatList
        data={queries}
        renderItem={renderQueryItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  queryCard: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  queryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
  },
  responseCard: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#e9e9e9',
    borderRadius: 5,
  },
});

export default QueryAndResponseComponent;
