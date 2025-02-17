import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

// Screens
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { EditProductScreen } from '../screens/EditProductScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';


// Types
export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Scanner: undefined;
  ProductDetails: { productId?: string };
  AddProduct: { barcode?: string };
  EditProduct: { productId: string };
  UpdateQuantity: { productId: string };
  Statistics: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',  // Dark background
  card: '#2D2D2D',       // Darker cards
  input: '#3D3D3D',      // Input background
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#3D3D3D',     // Pour les bordures
};

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.card,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleStyle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerBackTitleVisible: false,
  headerTintColor: COLORS.primary,
  ...Platform.select({
    ios: {
      ...TransitionPresets.SlideFromRightIOS,
    },
    android: {
      ...TransitionPresets.RevealFromBottomAndroid,
    },
  }),
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!isAuthenticated ? (
        // Routes non authentifiées
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
          }}
        />
      ) : (
        // Routes authentifiées
        <>
          <Stack.Screen 
            name="Tabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          
          {/* Regular Screens */}
          <Stack.Screen 
            name="ProductDetails" 
            component={ProductDetailsScreen}
            options={{
              headerTitle: 'Détails du produit',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerBackground: () => (
                <View 
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(45, 45, 45, 0.9)', // COLORS.card avec opacité
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }} 
                />
              ),
            }}
          />
          
          <Stack.Screen 
            name="EditProduct" 
            component={EditProductScreen}
            options={{
              headerTitle: 'Modifier le produit',
              presentation: 'modal',
              gestureEnabled: true,
              cardOverlayEnabled: true,
            }}
          />

          <Stack.Screen 
            name="Statistics" 
            component={StatisticsScreen}
            options={{
              headerTitle: 'Statistiques',
              presentation: 'card',
            }}
          />

          {/* Modal Screens */}
          <Stack.Group 
            screenOptions={{
              presentation: 'modal',
              gestureEnabled: true,
              cardOverlayEnabled: true,
              headerStyle: {
                backgroundColor: COLORS.card,
              },
            }}
          >
            <Stack.Screen 
              name="Scanner" 
              component={ScanScreen}
              options={{
                headerTitle: 'Scanner',
              }}
            />
            
            <Stack.Screen 
              name="AddProduct" 
              component={AddProductScreen}
              options={{
                headerTitle: 'Ajouter un produit',
              }}
            />
            
            
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};

// Types pour la navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 