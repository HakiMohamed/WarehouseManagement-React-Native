import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { Ionicons } from '@expo/vector-icons';
import { navigationStyles } from '../styles/navigation';

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',
  card: '#2D2D2D',
  input: '#3D3D3D',
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#3D3D3D',
};

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          ...navigationStyles.header,
          backgroundColor: COLORS.card,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          ...navigationStyles.headerTitle,
          color: COLORS.white,
        },
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          borderTopColor: COLORS.border,
          borderRadius: 0,
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...navigationStyles.tabLabel,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "apps" : "apps-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          headerTitle: 'Produits',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "grid" : "grid-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Produits',
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          headerTitle: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "qr-code" : "qr-code-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Scanner',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerTitle: 'Statistiques',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Statistiques',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}; 