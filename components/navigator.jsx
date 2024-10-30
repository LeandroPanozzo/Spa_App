import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./AuthContext";

export const Navigator = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isOwner, isProfessional, isSecretary } = useAuth();
  
  const navigation = useNavigation();
  const hamburgerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    toggleSidebar: () => setIsOpen(prevState => !prevState)
  }));

  const toggleSidebar = () => {
    setIsOpen(prevState => !prevState);
  };

  const handleOutsideClick = (event) => {
    if (isOpen && !hamburgerRef.current?.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleEscKey = (event) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Aquí puedes manejar eventos de teclado si es necesario
    }
  }, [isOpen, isAuthenticated]);

  // Si el usuario no está autenticado, no renderizamos nada
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.hamburger} onPress={toggleSidebar} ref={hamburgerRef}>
        <Text style={styles.hamburgerText}>☰</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContent} onPress={handleOutsideClick}>
            <View style={styles.contentSection}>
              <Text style={styles.title}>Administración</Text>
              <View style={styles.buttonGroup}>
                {isOwner && (
                  <>
                    <TouchableOpacity onPress={() => navigation.navigate('Clients')} style={styles.button}>
                      <Text style={styles.buttonText}>Listado de Usuarios</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ClientsByDay')} style={styles.button}>
                      <Text style={styles.buttonText}>Clientes por Día</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.button}>
                      <Text style={styles.buttonText}>Lista y Creación de Servicios</Text>
                    </TouchableOpacity>
                  </>
                )}
                {(isOwner || isProfessional) && (
                  <TouchableOpacity onPress={() => navigation.navigate('ClientsByProfessional')} style={styles.button}>
                    <Text style={styles.buttonText}>Clientes por Profesional</Text>
                  </TouchableOpacity>
                )}
                {isProfessional && (
                  <TouchableOpacity onPress={() => navigation.navigate('AppointmentsByProfessional')} style={styles.button}>
                    <Text style={styles.buttonText}>Servicios a Prestar</Text>
                  </TouchableOpacity>
                )}
                {(isSecretary || isOwner) && (
                  <TouchableOpacity onPress={() => navigation.navigate('PaymentsList')} style={styles.button}>
                    <Text style={styles.buttonText}>Pagos</Text>
                  </TouchableOpacity>
                )}
                {!isProfessional && (
                  <>
                    <TouchableOpacity onPress={() => navigation.navigate('Contact')} style={styles.button}>
                      <Text style={styles.buttonText}>Contactarse</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Appointments')} style={styles.button}>
                      <Text style={styles.buttonText}>Turnos</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('CommentsList')} style={styles.button}>
                  <Text style={styles.buttonText}>Comentarios</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')} style={styles.button}>
                  <Text style={styles.buttonText}>Anuncios</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('User')} style={styles.button}>
                  <Text style={styles.buttonText}>Perfil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
});

// Estilos para el componente
const styles = StyleSheet.create({
  navContainer: {
    position: 'relative',
  },
  hamburger: {
    padding: 10,
  },
  hamburgerText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    width: '100%',
  },
  contentSection: {
    marginTop: 50,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonGroup: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
