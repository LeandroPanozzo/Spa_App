import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../components/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export function ClientsByDay({ navigation }) {
  const [clientsByDate, setClientsByDate] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchClientsByDate();
    } else {
      navigation.navigate('Login'); // Cambia a la pantalla de inicio de sesión
    }
  }, [isAuthenticated, navigation]);

  const fetchClientsByDate = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/clients-by-day/grouped_by_date/`);
      console.log("Clientes por fecha obtenidos:", response.data);
      setClientsByDate(response.data);
    } catch (error) {
      console.error("Error al obtener clientes por fecha:", error);
    }
  };

  const toggleDate = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const renderClient = ({ item }) => (
    <View style={styles.clientCard}>
      <Text>Cliente: {item.first_name} {item.last_name}</Text>
      <Text>Servicios:</Text>
      <FlatList
        data={item.services}
        keyExtractor={(service, index) => index.toString()}
        renderItem={({ item: service }) => <Text>- {service}</Text>}
      />
    </View>
  );

  const renderDateItem = ({ item: date }) => (
    <View style={styles.clientsDayCard}>
      <TouchableOpacity onPress={() => toggleDate(date)}>
        <Text style={styles.dateTitle}>Fecha: {date}</Text>
      </TouchableOpacity>
      {expandedDate === date && (
        <FlatList
          data={clientsByDate[date]}
          keyExtractor={(client, index) => index.toString()}
          renderItem={renderClient}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Clientes por Día</Text>
      <FlatList
        data={Object.keys(clientsByDate)}
        keyExtractor={(date) => date}
        renderItem={renderDateItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  clientsDayCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clientCard: {
    marginTop: 8,
    paddingLeft: 16,
  },
});

export default ClientsByDay;
