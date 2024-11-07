import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity, StyleSheet, Modal, Linking } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    } else {
      fetchAppointments();
      fetchServices();
      fetchProfessionals();
      
    }
  }, [isAuthenticated, navigation]);

  const fetchAppointments = async () => {
    setError('');
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/appointments/`);
      setAppointments(response.data);
      
    } catch (error) {
      setError(`Error al cargar las citas: ${error.message}`);
    }
  };

  

  const fetchServices = async () => {
    setError('');
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/services/`);
      setServices(response.data);
    } catch (error) {
      setError(`Error al cargar los servicios: ${error.message}`);
    }
  };

  const fetchProfessionals = async () => {
    setError('');
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/professionals/`);
      setProfessionals(response.data);
    } catch (error) {
      setError(`Error al cargar los profesionales: ${error.message}`);
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedProfessional || selectedServices.length === 0 || !appointmentDate) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const appointmentData = {
      professional_id: selectedProfessional.id,
      services_ids: selectedServices.map(service => service.id),
      appointment_date: appointmentDate,
      discount: 0.1.toFixed(2),
    };

    try {
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/appointments/`, appointmentData);
      setAppointments(prev => [...prev, response.data]);
      resetForm();
      Toast.show({ text1: 'Cita creada con éxito!' });
      navigation.navigate('Payment', {appointmentId: response.data.id })
    } catch (error) {
      setError(`Error al crear la cita: ${error.message}`);
    }
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedProfessional(null);
    setAppointmentDate(new Date());
  };

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

  const handleDeleteAppointment = async (id) => {
    
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: async () => {
            try {
              console.log(`Intentando eliminar cita con ID: ${id}`); // Verificación
              await axios.delete(`${API_URL}/sentirseBien/api/v1/appointments/${id}/`);
              setAppointments(prev => prev.filter(appointment => appointment.id !== id));
              Toast.show({ text1: 'Cita eliminada!' });
            } catch (error) {
              setError(`Error al eliminar la cita: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const toggleServiceSelection = (service) => {
    setSelectedServices(prevSelected => {
      if (prevSelected.find(selected => selected.id === service.id)) {
        return prevSelected.filter(selected => selected.id !== service.id);
      } else {
        return [...prevSelected, service];
      }
    });
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text>Profesional: {item.professional.first_name} {item.professional.last_name}</Text>
      <Text>Servicios: {item.services_names.join(', ')}</Text>
      <Text>{new Date(item.appointment_date).toLocaleString()}</Text>
  
      {/* Mostrar el botón de pagar o descargar según el estado del payment */}
      {!item.payment ? (
        <Button
        title="Pague desde la web"
        
        color="green"
      />
      ) : (
        <Button
          title="Descargar"
          onPress={() => Linking.openURL(`${API_URL}/sentirseBien/api/v1/appointments/${item.id}/download_invoice/`)}
          color="blue"
        />
      )}
      <Button title="Eliminar" onPress={() => handleDeleteAppointment(item.id)} color="red" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Citas</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.subtitle}>Crear Nueva Cita</Text>

      <TouchableOpacity
        onPress={() => setShowProfessionalModal(true)}
        style={[styles.input, styles.professionalButton]}
      >
        <Text>
          {selectedProfessional ? `${selectedProfessional.first_name} ${selectedProfessional.last_name}` : 'Selecciona Profesional'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showProfessionalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfessionalModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Profesional</Text>
            <FlatList
              data={professionals}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.professionalItem}
                  onPress={() => {
                    setSelectedProfessional(item);
                    setShowProfessionalModal(false);
                  }}
                >
                  <Text>{item.first_name} {item.last_name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            <Button title="Cerrar" onPress={() => setShowProfessionalModal(false)} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setShowServiceModal(true)}
        style={[styles.input, styles.serviceButton]}
      >
        <Text>
          {selectedServices.length > 0
            ? selectedServices.map(service => `${service.name} ($${service.price})`).join(', ')
            : 'Selecciona Servicios'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showServiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona Servicios</Text>
            <FlatList
              data={services}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.serviceItem}
                  onPress={() => toggleServiceSelection(item)}
                >
                  <Text>{item.name} - ${item.price}</Text>
                  {selectedServices.find(service => service.id === item.id) && <Text>✓</Text>}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            <Button title="Cerrar" onPress={() => setShowServiceModal(false)} />
          </View>
        </View>
      </Modal>

      <Button title="Selecciona Fecha y Hora" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={appointmentDate}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setAppointmentDate(selectedDate);
          }}
        />
      )}

      <Button title="Crear Cita" onPress={handleAppointmentSubmit} />
      <Toast ref={Toast.setRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1, // Added to allow proper height for FlatList
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  appointmentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  professionalButton: {
    backgroundColor: '#e0e0e0',
  },
  serviceButton: {
    backgroundColor: '#e0e0e0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  professionalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  serviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    flexGrow: 1,
  },
});

export default AppointmentsList;