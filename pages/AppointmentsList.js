import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, TextInput, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import Select from 'react-native-select-dropdown';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { API_URL } from './config';

export function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [error, setError] = useState('');

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
    if (!selectedProfessional || !appointmentDate) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const appointmentData = {
      professional_id: selectedProfessional.id,
      services_ids: selectedServices.map(service => service.id),
      appointment_date: appointmentDate,
    };

    try {
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/appointments/`, appointmentData);
      setAppointments(prev => [...prev, response.data]);
      resetForm();
      Toast.show({ text1: 'Cita creada con éxito!' });
    } catch (error) {
      setError(`Error al crear la cita: ${error.message}`);
    }
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedProfessional(null);
    setAppointmentDate('');
  };

  const handleDeleteAppointment = async (id) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: async () => {
            try {
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

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text>Profesional: {item.professional.first_name} {item.professional.last_name}</Text>
      <Text>Servicios: {item.services_names.join(', ')}</Text>
      <Text>{new Date(item.appointment_date).toLocaleString()}</Text>
      <Button title="Eliminar" onPress={() => handleDeleteAppointment(item.id)} color="red" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lista de Citas</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer} 
      />
      <TextInput
        placeholder="Fecha y Hora"
        value={appointmentDate}
        onChangeText={setAppointmentDate}
        style={styles.input}
      />
      
      {/* Selector de Profesional */}
      <Select
        data={professionals.map(prof => ({ id: prof.id, name: `${prof.first_name} ${prof.last_name}` }))}
        onSelect={(item) => setSelectedProfessional(item)}
        defaultButtonText="Seleccionar Profesional"
        buttonStyle={styles.selectButton}
        buttonTextAfterSelection={(selectedItem) => selectedItem.name}
      />

      {/* Selector de Servicio */}
      <Select
        data={services.map(serv => ({ id: serv.id, name: serv.name }))}
        onSelect={(item) => setSelectedServices(prev => [...prev, item])} 
        defaultButtonText="Seleccionar Servicios"
        buttonStyle={styles.selectButton}
        buttonTextAfterSelection={(selectedItem) => selectedItem.name}
        isMulti={true} // Asegúrate de que tu componente soporte selección múltiple
      />

      <Button title="Crear Cita" onPress={handleAppointmentSubmit} />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  selectButton: {
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    height: 40,
  },
});

// Exportación del componente
export default AppointmentsList;
