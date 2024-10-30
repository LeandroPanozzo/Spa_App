import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer'; // Importa el Drawer Navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './pages/AuthContext';
import HomeScreen from './pages/HomeScreen';
import DetailsScreen from './pages/DetailsScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';

// Crea instancias de los navegadores
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home">
          {/* Aquí defines las pantallas que quieres que estén en el Drawer */}
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Details" component={DetailsScreen} />

          <Drawer.Screen name="Login" component={LoginScreen} />
          <Drawer.Screen name="Register" component={RegisterScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
