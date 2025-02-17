import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = () => {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const { login } = useAuth();

  const steps = [
    {
      title: "Bienvenue sur Stockyfy",
      mainDescription: "La solution intelligente pour votre gestion de stock",
      icon: "cube-outline",
      features: [
        {
          icon: "shield-checkmark-outline",
          title: "Sécurisé",
          description: "Vos données sont protégées et sauvegardées"
        },
        {
          icon: "flash-outline",
          title: "Rapide",
          description: "Interface optimisée pour une utilisation fluide"
        },
        {
          icon: "cloud-outline",
          title: "Cloud",
          description: "Accédez à vos données depuis n'importe où"
        }
      ]
    },
    {
      title: "Gestion Intelligente",
      mainDescription: "Gérez votre inventaire comme jamais auparavant",
      icon: "scan-outline",
      features: [
        {
          icon: "barcode-outline",
          title: "Scanner",
          description: "Scannez vos produits rapidement"
        },
        {
          icon: "notifications-outline",
          title: "Alertes",
          description: "Notifications de stock bas automatiques"
        },
        {
          icon: "search-outline",
          title: "Recherche",
          description: "Retrouvez vos produits instantanément"
        }
      ]
    },
    {
      title: "Statistiques Détaillées",
      mainDescription: "Prenez des décisions éclairées grâce aux données",
      icon: "stats-chart-outline",
      features: [
        {
          icon: "trending-up-outline",
          title: "Tendances",
          description: "Analysez l'évolution de vos stocks"
        },
        {
          icon: "pie-chart-outline",
          title: "Rapports",
          description: "Générez des rapports détaillés"
        },
        {
          icon: "calculator-outline",
          title: "Prévisions",
          description: "Anticipez vos besoins futurs"
        }
      ]
    }
  ];

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = async () => {
    if (!secretKey.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre clé secrète');
      return;
    }

    setLoading(true);
    try {
      const success = await login(secretKey);
      if (!success) {
        Alert.alert('Erreur', 'Clé secrète invalide');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step) => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.mainIconContainer}>
          <Ionicons name={step.icon} size={40} color={COLORS.white} />
        </View>
        <Text style={styles.stepMainTitle}>{step.title}</Text>
        <Text style={styles.stepMainDescription}>{step.mainDescription}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {step.features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Ionicons name="cube" size={64} color={COLORS.primary} />
            <Text style={styles.title}>STOCKYFY</Text>
          </View>

          {!showLogin ? (
            <>
              {renderStep(steps[currentStep])}

              {/* Navigation Buttons */}
              <View style={styles.navigationButtons}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    style={[styles.navButton, styles.prevButton]}
                    onPress={handlePrevious}
                  >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    <Text style={[styles.buttonText, styles.prevButtonText]}>Précédent</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={handleNextStep}
                >
                  <Text style={styles.buttonText}>
                    {currentStep === steps.length - 1 ? "Commencer" : "Suivant"}
                  </Text>
                  <Ionicons 
                    name={currentStep === steps.length - 1 ? "log-in-outline" : "arrow-forward"} 
                    size={24} 
                    color={COLORS.white} 
                  />
                </TouchableOpacity>
              </View>

              {/* Progress Dots */}
              <View style={styles.progressDots}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, currentStep === index && styles.activeDot]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.loginSection}>
              <Text style={styles.loginTitle}>Connexion</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={24} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre clé secrète"
                  placeholderTextColor={COLORS.textSecondary}
                  value={secretKey}
                  onChangeText={setSecretKey}
                  secureTextEntry={true}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Se connecter</Text>
                    <Ionicons name="log-in-outline" size={24} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 16,
  },
  stepContent: {
    marginBottom: 40,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepMainDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  prevButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  prevButtonText: {
    color: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loginSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.white,
    fontSize: 16,
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
}); 