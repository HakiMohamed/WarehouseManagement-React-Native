import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',
  card: '#2D2D2D',
  input: '#3D3D3D',
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#3D3D3D',
};

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, color = COLORS.primary }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]} 
      bounces={false}
    >
      <View style={styles.header}>
        <BlurView intensity={30} tint="dark" style={styles.blurHeader}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/default-avatar.png')}
                style={styles.avatar}
              />
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={14} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>ID: {user?.id}</Text>
            <Text style={styles.email}>Entrepôt: {user?.warehouseId}</Text>
          </View>
        </BlurView>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <MenuItem
            icon="person-outline"
            title="Informations personnelles"
            onPress={() => {}}
            color={COLORS.primary}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Activé"
            onPress={() => {}}
            color={COLORS.primary}
          />
          <MenuItem
            icon="lock-closed-outline"
            title="Sécurité"
            onPress={() => {}}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <MenuItem
            icon="language-outline"
            title="Langue"
            subtitle="Français"
            onPress={() => {}}
            color={COLORS.primary}
          />
          <MenuItem
            icon="moon-outline"
            title="Thème"
            subtitle="Sombre"
            onPress={() => {}}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide</Text>
          <MenuItem
            icon="help-circle-outline"
            title="Centre d'aide"
            onPress={() => {}}
            color={COLORS.primary}
          />
          <MenuItem
            icon="document-text-outline"
            title="Conditions d'utilisation"
            onPress={() => {}}
            color={COLORS.primary}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    overflow: 'hidden',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  blurHeader: {
    backgroundColor: COLORS.card,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 16,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 60,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
});
