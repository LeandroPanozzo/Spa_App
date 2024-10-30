import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "../components/AuthContext"; 
import jsPDF from "jspdf";
import "jspdf-autotable";  
import logo from '../assets/bigLogoSPA.png'; 

const API_URL = import.meta.env.VITE_API_URL;

export function ClientsByProfessional({ navigation }) {
  const [clientsByProfessional, setClientsByProfessional] = useState({});
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedProfessional, setExpandedProfessional] = useState(null);  
  const { isAuthenticated, isProfessional, user } = useAuth(); 

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfessionals();
      fetchClientsByProfessional();
    } else {
      navigation.navigate('Login'); // Navegación a la pantalla de login
    }
  }, [isAuthenticated, navigation]);

  const fetchProfessionals = async () => {
    try {
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/professionals/`);
      setProfessionals(response.data);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  const fetchClientsByProfessional = async () => {
    try {
      const professionalId = isProfessional ? user.id : selectedProfessional;
      const response = await axios.get(`${API_URL}/sentirseBien/api/v1/clients-by-professional/`, {
        params: {
          professional_id: professionalId,
          start_date: startDate,
          end_date: endDate
        }
      });
      setClientsByProfessional(response.data);
    } catch (error) {
      console.error("Error fetching clients by professional:", error);
    }
  };

  const handleProfessionalChange = (id) => {
    setSelectedProfessional(id);
  };

  const handleStartDateChange = (text) => {
    setStartDate(text);
  };

  const handleEndDateChange = (text) => {
    setEndDate(text);
  };

  const toggleProfessional = (professional) => {
    setExpandedProfessional((prev) => (prev === professional ? null : professional));
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    try {
      const logoBase64 = await convertImageToBase64(logo); // Esta función debe ser definida
      const logoWidth = 70;
      const logoHeight = 30;
      const xPosLogo = (pageWidth - logoWidth) / 2;

      doc.addImage(logoBase64, 'PNG', xPosLogo, 10, logoWidth, logoHeight);

      let currentY = 10 + logoHeight + 10; 

      const title = "Clientes por Profesional";
      const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
      doc.text(title, titleX, currentY); 
      currentY += 10;

      const startDateText = `Fecha de inicio: ${startDate || 'No definida'}`;
      const startDateX = (pageWidth - doc.getTextWidth(startDateText)) / 2;
      doc.text(startDateText, startDateX, currentY);
      currentY += 10;

      const endDateText = `Fecha de fin: ${endDate || 'No definida'}`;
      const endDateX = (pageWidth - doc.getTextWidth(endDateText)) / 2;
      doc.text(endDateText, endDateX, currentY);
      currentY += 10;

      Object.keys(clientsByProfessional).forEach((professional) => {
        const appointments = clientsByProfessional[professional];

        if (currentY + 20 > doc.internal.pageSize.height) {
          doc.addPage();
          currentY = 10; 
        }

        doc.text(`Profesional: ${professional}`, 10, currentY);
        currentY += 10;

        const rows = appointments.map((appointment) => [
          appointment.client_first_name,
          appointment.client_last_name,
          appointment.appointment_date,
          appointment.services.join(', ')
        ]);

        doc.autoTable({
          head: [['Nombre', 'Apellido', 'Fecha de Cita', 'Servicios']],
          body: rows,
          startY: currentY,
          theme: 'striped',
        });

        currentY = doc.previousAutoTable.finalY + 10;
      });

      return doc; 
    } catch (error) {
      console.error('Error al agregar el logo al PDF:', error);
    }
  };

  const downloadPDF = async () => {
    const doc = await generatePDF();
    doc.save("clientes_por_profesional.pdf");
  };

  const printPDF = async () => {
    const doc = await generatePDF();
    const pdfOutput = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfOutput);
    
    const printWindow = window.open(pdfUrl);

    printWindow.onload = () => {
      printWindow.print();
    };

    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Clientes por Profesional</Text>

      <View style={styles.filters}>
        <Text>Selecciona un profesional:</Text>
        {isProfessional ? (
          <Text>{user.first_name} {user.last_name}</Text>
        ) : (
          <FlatList
            data={professionals}
            keyExtractor={(professional) => professional.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleProfessionalChange(item.id)}>
                <Text>{item.first_name} {item.last_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <Text>Fecha de inicio:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={handleStartDateChange}
        />

        <Text>Fecha de fin:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={handleEndDateChange}
        />

        <View style={styles.buttonGroup}>
          <Button title="Filtrar" onPress={fetchClientsByProfessional} />
          <Button title="Descargar PDF" onPress={downloadPDF} />
          <Button title="Imprimir PDF" onPress={printPDF} />
        </View>
      </View>

      <FlatList
        data={Object.keys(clientsByProfessional)}
        keyExtractor={(professional) => professional}
        renderItem={({ item: professional }) => (
          <View style={styles.professionalCard}>
            <TouchableOpacity onPress={() => toggleProfessional(professional)}>
              <Text style={styles.professionalTitle}>
                {professional} {expandedProfessional === professional ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {expandedProfessional === professional && (
              <FlatList
                data={clientsByProfessional[professional]}
                keyExtractor={(appointment, index) => index.toString()}
                renderItem={({ item: appointment }) => (
                  <View style={styles.appointmentItem}>
                    <Text>Cliente: {appointment.client_first_name} {appointment.client_last_name}</Text>
                    <Text>Fecha y Hora: {appointment.appointment_date}</Text>
                    <Text>Servicios: {appointment.services.join(', ')}</Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
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
  filters: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  professionalCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  professionalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  appointmentItem: {
    marginTop: 8,
  },
});

export default ClientsByProfessional;
