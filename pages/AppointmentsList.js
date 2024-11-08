import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Button, FlatList, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { API_URL } from './config';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importamos los íconos


export function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState('');
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
    if (!selectedProfessional || selectedServices.length === 0 || !appointmentDate || !appointmentTime) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const appointmentData = {
      professional_id: selectedProfessional.id,
      services_ids: selectedServices.map(service => service.id),
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      discount: 0.1.toFixed(2),
    };

    try {
      const response = await axios.post(`${API_URL}/sentirseBien/api/v1/appointments/`, appointmentData);
      setAppointments(prev => [...prev, response.data]);
      resetForm();
      Toast.show({ text1: 'Cita creada con éxito!' });
      navigation.navigate('Payment', { appointmentId: response.data.id });
    } catch (error) {
      setError(`Error al crear la cita: ${error.message}`);
    }
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedProfessional(null);
    setAppointmentDate(new Date());
    setAppointmentTime('');
  };

  const handleDatePickerChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    } else {
      setAppointmentDate(selectedDate);
      setShowDatePicker(false);
    }
  };

  const handleTimePickerChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
    } else {
      setAppointmentTime(moment(selectedTime).format('HH:mm')); // Formato de hora
      setShowTimePicker(false);
    }
  };

  // Función para alternar la selección de servicios
  const toggleServiceSelection = (service) => {
    setSelectedServices(prevSelected => {
      if (prevSelected.find(selected => selected.id === service.id)) {
        return prevSelected.filter(selected => selected.id !== service.id); // Desmarcar si ya está seleccionado
      } else {
        return [...prevSelected, service]; // Marcar como seleccionado
      }
    });
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text>Profesional: {item.professional.first_name} {item.professional.last_name}</Text>
      <Text>Servicios: {item.services_names.join(', ')}</Text>
      <Text>{new Date(item.appointment_date).toLocaleString()}</Text>

      <View style={styles.buttonContainer}>
        {!item.payment ? (
          <Button
            title="Pague desde la web"
            onPress={() => Linking.openURL(`${API_URL}/sentirseBien/api/v1/appointments/${item.id}/payment/`)}
            color="#00be3f"
          />
        ) : (
          <Button
            title="Descargar"
            onPress={() => Linking.openURL(`${API_URL}/sentirseBien/api/v1/appointments/${item.id}/download_invoice/`)}
            color="blue"
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Eliminar" onPress={() => handleDeleteAppointment(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
            <Button
              title="Cerrar"
              onPress={() => setShowProfessionalModal(false)}
              style={[styles.button, styles.closeButton]}
              titleStyle={styles.buttonText}
              color="red"
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setShowServiceModal(true)}
        style={[styles.input, styles.serviceButton]}
      >
        <Text>
          {selectedServices.length > 0 ? selectedServices.map(service => service.name).join(', ') : 'Selecciona Servicios'}
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
                  onPress={() => toggleServiceSelection(item)} // Usamos la función aquí
                >
                  <View style={styles.serviceItemContainer}>
                    <Text>{item.name}</Text>
                    {selectedServices.find(service => service.id === item.id) && (
                      <Icon name="check-circle" size={20} color="green" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            <Button
              title="Cerrar"
              onPress={() => setShowServiceModal(false)}
              style={[styles.button, styles.closeButton]}
              color="red"
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[styles.input, styles.serviceButton]}
      >
        <Text>{appointmentDate ? moment(appointmentDate).format('LL') : 'Selecciona Fecha'}</Text>
      </TouchableOpacity>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona Fecha</Text>
            <DateTimePicker
              value={appointmentDate}
              mode="date"
              onChange={handleDatePickerChange}
              display="default"
            />
            <Button
              title="Cerrar"
              onPress={() => setShowDatePicker(false)}
              style={[styles.button, styles.closeButton]}
              color="red"
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        style={[styles.input, styles.serviceButton]}
      >
        <Text>{appointmentTime ? appointmentTime : 'Selecciona Hora'}</Text>
      </TouchableOpacity>

      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona Hora</Text>
            <DateTimePicker
              value={new Date()}
              mode="time"
              onChange={handleTimePickerChange}
              display="default"
            />
            <Button
              title="Cerrar"
              onPress={() => setShowTimePicker(false)}
              style={[styles.button, styles.closeButton]}
              color="red"
            />
          </View>
        </View>
      </Modal>

      <Button title="Crear Cita" onPress={handleAppointmentSubmit} color= "#00be3f" style={styles.buttonContainerr} />
      <Text style={styles.modalTitle}></Text>

    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff7f8a',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#ff7f8a'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  appointmentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f4f8',
    marginVertical: 10,
  },
  professionalButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000000', // Color del borde negro
  borderWidth: 1,         // Ancho del borde (puedes ajustar según prefieras)
  },
  serviceButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000000', // Color del borde negro
  borderWidth: 1,         // Ancho del borde (puedes ajustar según prefieras)
  },
  dateButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000000', // Color del borde negro
  borderWidth: 1,         // Ancho del borde (puedes ajustar según prefieras)
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
    textAlign: 'center',
  },
  professionalItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  serviceItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimePicker: {
    marginVertical: 5,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 8,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#d9534f',
  },
  createButton: {
    backgroundColor: '#5cb85c',
    borderRadius: 20,
  },
  listContainer: {
    paddingBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 5, // Añadimos separación entre los botones
  },
  buttonContainerr: {
    marginBottom: 50, // Añadimos separación entre los botones
  },
});


export default AppointmentsList;