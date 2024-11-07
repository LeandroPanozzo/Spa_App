import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './pages/AuthContext';
import { View, Image, StyleSheet } from 'react-native';
import HomeScreen from './pages/HomeScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import QueryAndResponseComponent from './pages/QueryAndResponseComponent';
import AppointmentsList from './pages/AppointmentsList';
import CommentsList from './pages/CommentsList';
import Announcements from './pages/Announcements';
import UserEdit from './pages/UserEdit';
import PaymentPage from './pages/PaymentPage'; // Ajusta según la ruta real

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Componente de encabezado personalizado con botón de hamburguesa
const CustomHeader = () => (
  <View style={styles.header}>
    <DrawerToggleButton style={styles.hamburger} />
    <View style={styles.headerContent}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
    </View>
  </View>
);


const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: () => <CustomHeader />, // Definimos el encabezado personalizado
      }}
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
        <Stack.Navigator>
          <Stack.Screen name = "AppNavigator" component = {AppNavigator}/>
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
  },
  hamburger: {
    marginRight: 10,
  },
  headerContent: {
    flex: 1, // Toma todo el espacio disponible
    alignItems: 'center', // Alinea el logo verticalmente
    justifyContent: 'center', // Centra horizontalmente el logo
    marginRight: '15px'
  },
  logo: {
    width: 60,
    height: 60,
  },
});

export default App;
