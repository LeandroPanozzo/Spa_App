import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';
import { API_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity} from 'react-native'; // Asegúrate de importar TouchableOpacity


export function CommentsList() {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, isStaff, logout } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/posts/`);
      setPosts(response.data);
    } catch (error) {
      setError('Error al cargar las publicaciones');
    }
  };

  const handlePostSubmit = async () => {
    const postData = {
      titulo,
      contenido,
      alias: !isAuthenticated ? alias : null,
    };

    try {
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/posts/`, postData);
      setPosts([...posts, response.data]);
      setTitulo('');
      setContenido('');
      setAlias('');
      Toast.show({ type: 'success', text1: 'Publicación creada!' });
    } catch (error) {
      setError('Error al crear la publicación');
    }
  };

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

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
                await AsyncStorage.setItem('access_token', response.data.access);
                return axios(originalRequest);
            } catch {
                logout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
  );

  const renderHeader = () => (
    !isStaff && (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Crear Publicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Título del post"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Contenido del post"
          value={contenido}
          onChangeText={setContenido}
          multiline
        />
        {!isAuthenticated && (
          <TextInput
            style={styles.input}
            placeholder="Alias para postear"
            value={alias}
            onChangeText={setAlias}
          />
        )}
        <TouchableOpacity 
      style={styles.botonModerno} 
      onPress={handlePostSubmit} 
      activeOpacity={0.7} // Para darle un efecto de opacidad cuando se presiona
    >
      <Text style={[styles.textoBoton]}>
        Crear Publicación
      </Text>
    </TouchableOpacity>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postTitle}>{item.titulo}</Text>
            <Text style={styles.postContent}>{item.contenido}</Text>
            <Text style={styles.postAuthor}>Publicado por: {item.autor || item.alias}</Text>
            <Text style={styles.postTime}>{item.time_since_posted}</Text>
          </View>
        )}
        ListEmptyComponent={error && <Text style={styles.errorText}>{error}</Text>}
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  mainTitle: {
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  post: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    color: '#fc9ba9',
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#495057',
    marginBottom: 15,
    fontSize: 16,
    lineHeight: 24,
  },
  postAuthor: {
    color: '#28a745',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  postTime: {
    color: '#6c757d',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
  },
  formTitle: {
    color: '#fc9ba9',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  botonModerno: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5, // para sombra en Android
    shadowColor: '#000', // para sombra en iOS
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',

    textAlign: 'center'
  },

});

export default CommentsList;