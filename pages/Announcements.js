import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message'; // Importa Toast
import { API_URL } from './config'; // Cambiado para usar el import desde config.js

export function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementDate, setAnnouncementDate] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, isStaff, logout, isOwner, isSecretary } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 6;

  // Configura la URL base para Axios
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/sentirseBien/api/v1/announcements/');
      setAnnouncements(response.data);
    } catch (error) {
      setError('Error al cargar los anuncios');
    }
  };

  const handleAnnouncementSubmit = async () => {
    const announcementData = {
      title: announcementTitle,
      content: announcementContent,
      date_description: announcementDate,
    };

    try {
      const response = await axios.post('/sentirseBien/api/v1/announcements/', announcementData);
      setAnnouncements([response.data, ...announcements]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementDate('');
      Toast.show({ type: 'success', text1: 'Anuncio creado!' });
    } catch (error) {
      setError('Error al crear el anuncio');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await axios.delete(`/sentirseBien/api/v1/announcements/${id}/`);
      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      Toast.show({ type: 'success', text1: 'Anuncio eliminado!' });
    } catch (error) {
      setError('Error al eliminar el anuncio');
    }
  };

  // Paginación
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
  const totalPages = Math.ceil(announcements.length / announcementsPerPage);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anuncios Importantes</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={currentAnnouncements}
        keyExtractor={(announcement) => announcement.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementDescription}>{item.content}</Text>
            <Text style={styles.announcementDate}>{item.date_description}</Text>
            {(isOwner || isSecretary) && (
              <Button
                title="Eliminar"
                color="red"
                onPress={() => handleDeleteAnnouncement(item.id)}
              />
            )}
          </View>
        )}
      />

      <View style={styles.pagination}>
        <Button
          title="Anterior"
          onPress={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        />
        <Text>Página {currentPage} de {totalPages}</Text>
        <Button
          title="Siguiente"
          onPress={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </View>

      {(isOwner || isSecretary) && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Título del anuncio"
            value={announcementTitle}
            onChangeText={setAnnouncementTitle}
            required
          />
          <TextInput
            style={styles.input}
            placeholder="Contenido del anuncio"
            value={announcementContent}
            onChangeText={setAnnouncementContent}
            required
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción de fechas"
            value={announcementDate}
            onChangeText={setAnnouncementDate}
            required
          />
          <Button title="Crear Anuncio" onPress={handleAnnouncementSubmit} />
        </View>
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fc9ba9',
  },
  announcementDescription: {
    marginBottom: 10,
    color: '#495057',
  },
  announcementDate: {
    color: '#6c757d',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
});

export default Announcements;
