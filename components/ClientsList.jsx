import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Switch, StyleSheet } from "react-native";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export function ClientsList() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [filter, setFilter] = useState("all");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    } else {
      // Navegar a la pantalla de inicio de sesión
    }
  }, [isAuthenticated]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/clients/`);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handlePermissionChange = async (clientId, field) => {
    try {
      const client = clients.find(client => client.id === clientId);
      const updatedClient = { ...client, [field]: !client[field] };
      await axios.put(`${API_URL}/sentirseBien/api/v1/clients/${clientId}/`, updatedClient);
      setClients(prevClients => prevClients.map(c => (c.id === clientId ? updatedClient : c)));
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const toggleClient = (clientId) => {
    setExpandedClientId(prev => (prev === clientId ? null : clientId));
  };

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientsToDisplay = () => {
    switch (filter) {
      case "owners":
        return filteredClients.filter(client => client.is_owner);
      case "professionals":
        return filteredClients.filter(client => client.is_professional);
      case "secretaries":
        return filteredClients.filter(client => client.is_secretary);
      case "regular":
        return filteredClients.filter(client => !client.is_owner && !client.is_professional && !client.is_secretary);
      default:
        return filteredClients;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTitle()}</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por nombre o apellido"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.filterButtons}>
        {["all", "owners", "professionals", "secretaries", "regular"].map(type => (
          <Button
            key={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            onPress={() => setFilter(type)}
          />
        ))}
      </View>

      <FlatList
        data={getClientsToDisplay()}
        keyExtractor={(client) => client.id.toString()}
        renderItem={({ item }) => (
          <ClientRow
            client={item}
            toggleClient={toggleClient}
            expandedClientId={expandedClientId}
            handlePermissionChange={handlePermissionChange}
          />
        )}
      />
    </View>
  );
}

const ClientRow = ({ client, toggleClient, expandedClientId, handlePermissionChange }) => (
  <View style={styles.clientRow}>
    <TouchableOpacity onPress={() => toggleClient(client.id)}>
      <Text style={styles.clientName}>
        {client.first_name} {client.last_name} {expandedClientId === client.id ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>
    {expandedClientId === client.id && (
      <View style={styles.clientDetails}>
        <Text>Username: {client.username}</Text>
        <View style={styles.permissions}>
          <View style={styles.permissionRow}>
            <Text>Dueño</Text>
            <Switch
              value={client.is_owner}
              onValueChange={() => handlePermissionChange(client.id, 'is_owner')}
            />
          </View>
          <View style={styles.permissionRow}>
            <Text>Profesional</Text>
            <Switch
              value={client.is_professional}
              onValueChange={() => handlePermissionChange(client.id, 'is_professional')}
            />
          </View>
          <View style={styles.permissionRow}>
            <Text>Secretaria</Text>
            <Switch
              value={client.is_secretary}
              onValueChange={() => handlePermissionChange(client.id, 'is_secretary')}
            />
          </View>
        </View>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clientRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientName: {
    fontSize: 18,
  },
  clientDetails: {
    marginTop: 8,
    paddingLeft: 16,
  },
  permissions: {
    marginTop: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default ClientsList;
