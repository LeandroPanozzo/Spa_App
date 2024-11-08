import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from './config';

export function PaymentPage() {
  const route = useRoute();
  const { appointmentId } = route.params || {};
  const [creditCard, setCreditCard] = useState('');
  const [pin, setPin] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [totalPayment, setTotalPayment] = useState(0); // Estado para almacenar el total del pago
  const [error, setError] = useState('');
  const { isAuthenticated, isStaff, logout, isSecretary } = useAuth();
  const navigation = useNavigation();
  

  if (!appointmentId) {
    return (
      <View>
        <Text>Error: No se proporcionó el ID de la cita.</Text>
      </View>
    );
  }

  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/sentirseBien/api/v1/payment-types/`);
        setPaymentTypes(response.data);
      } catch (error) {
        setError('Error al cargar los tipos de pago');
      }
    };

    fetchPaymentTypes();
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/appointments/${appointmentId}/`);
      // Calcular el total del pago sumando los precios de los servicios
      const total = response.data.services_prices.reduce((acc, price) => acc + parseFloat(price), 0);
      setTotalPayment(total); // Asignar el total calculado al estado
    } catch (error) {
      setError('Error al cargar los detalles de la cita');
    }
  };

  const validateInputs = () => {
    const cardRegex = /^[0-9]{16}$/; // 16 dígitos
    const pinRegex = /^[0-9]{4,6}$/; // 4 a 6 dígitos

    if (!cardRegex.test(creditCard)) {
      setError('El número de tarjeta debe tener 16 dígitos y contener solo números.');
      return false;
    }

    if (!pinRegex.test(pin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos y contener solo números.');
      return false;
    }

    setError(''); // Limpiar el error si las validaciones son correctas
    return true;
  };

  const handlePaymentSubmit = async () => {
    if (!validateInputs()) {
      return; // Si la validación falla, no proceder
    }

    try {
      await axios.post(`${API_URL}/sentirseBien/api/v1/payments/`, {
        appointment: appointmentId,
        credit_card: creditCard,
        pin: pin,
        payment_type: paymentType,
        discount: 0.1,
      });
      Toast.show({
        type: 'success',
        text1: 'Pago Exitoso!',
      });
      navigation.navigate('Citas');
    } catch (error) {
      setError('Error al procesar el pago.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error al procesar el pago.',
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title1}>Completar Pago</Text>
      <Text style={styles.title}>Por reservar desde la APP tiene un 10% de descuento si completa su pago ahora mismo</Text>
      <Text style={styles.label}>Número de Tarjeta</Text>
      <TextInput
        style={styles.input}
        value={creditCard}
        onChangeText={setCreditCard}
        keyboardType="numeric"
        maxLength={16}
        placeholder="Número de tarjeta"
      />
      <Text style={styles.label}>PIN</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={6}
        placeholder="PIN"
        secureTextEntry
      />
      <Text style={styles.label}>Tipo de Pago</Text>
      <Picker
        selectedValue={paymentType}
        onValueChange={(itemValue) => setPaymentType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un tipo de pago" value="" />
        {paymentTypes.map((type) => (
          <Picker.Item key={type.id} label={type.name} value={type.id} />
        ))}
      </Picker>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.buttonContainer} onPress={handlePaymentSubmit}>
        <Text style={styles.buttonText}>Pagar</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Total a pagar: {totalPayment}</Text>
      <Text style={styles.warningText}>Por favor, preséntese a la cita con la factura de pago.</Text>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title1: {
    fontSize: 32,
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: 'red',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  picker: {
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    backgroundColor: '#00be3f',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  warningText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
    flexWrap: 'wrap', // Hace que el texto se ajuste dentro del contenedor
    width: '100%',    // Asegura que el texto ocupe todo el ancho disponible
  },
});

export default PaymentPage;
