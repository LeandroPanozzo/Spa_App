import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './pages/AuthContext';
import { View, Image, StyleSheet, Text } from 'react-native';
import HomeScreen from './pages/HomeScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import QueryAndResponseComponent from './pages/QueryAndResponseComponent';
import AppointmentsList from './pages/AppointmentsList';
import CommentsList from './pages/CommentsList';
import Announcements from './pages/Announcements';
import UserEdit from './pages/UserEdit';
import PaymentPage from './pages/PaymentPage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Componente de encabezado personalizado con título encima del logo
const CustomHeader = ({ title }) => (
  <View style={styles.header}>
    <View style={styles.hamburgerContainer}>
      <DrawerToggleButton style={styles.hamburger} />
    </View>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
    </View>
    <View style={styles.hamburgerPlaceholder} /> 
  </View>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        header: () => <CustomHeader title={route.name} />, // Pasa el nombre de la ruta como título
      })}
    >
      {isAuthenticated ? (
        <>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Consultas" component={QueryAndResponseComponent} />
          <Drawer.Screen name="Citas" component={AppointmentsList} />
          <Drawer.Screen name="Comentarios" component={CommentsList} />
          <Drawer.Screen name="Anuncios" component={Announcements} />
          <Drawer.Screen name="Editar perfil" component={UserEdit} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Login" component={LoginScreen} />
          <Drawer.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
          <Stack.Screen name="Payment" component={PaymentPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between', // Distribuye el botón de hamburguesa y el contenido del encabezado
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Hace que ocupe el espacio central
    flexDirection: 'column', // Coloca el título encima del logo
  },
  hamburgerContainer: {
    width: 40, // Asegura el ancho para el botón de hamburguesa a la izquierda
    alignItems: 'flex-start',
  },
  hamburger: {
    marginRight: 10,
  },
  hamburgerPlaceholder: {
    width: 40, // Asegura un espacio vacío a la derecha para balancear el diseño
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 5, // Espacio entre el título y el logo
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;
