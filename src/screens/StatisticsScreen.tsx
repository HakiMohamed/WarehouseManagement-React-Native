import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useProduct } from '../context/ProductContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RNHTMLtoPDF from 'react-native-html-to-pdf-lite';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',
  card: '#2D2D2D',
  input: '#3D3D3D',
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#3D3D3D',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#FF3B30',
};

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForLabels: {
    fontSize: "10",
    fill: COLORS.textSecondary,
  },
  propsForBackgroundLines: {
    stroke: `${COLORS.border}50`,
  },
};

export const StatisticsScreen = () => {
  const { products, loading } = useProduct();
  const { user } = useAuth();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const statistics = React.useMemo(() => {
    if (!products) return null;

    const totalProducts = products.length;
    const outOfStock = products.filter(p => 
      !p.stocks?.[0]?.quantity || p.stocks[0].quantity === 0
    ).length;
    const lowStock = products.filter(p => {
      const stock = p.stocks?.[0];
      return stock?.quantity && stock.minQuantity && stock.quantity <= stock.minQuantity;
    }).length;
    const totalValue = products.reduce((sum, p) => 
      sum + ((p.price || 0) * (p.stocks?.[0]?.quantity || 0)), 0
    );

    const stockPercentage = (totalProducts > 0) ? 
      ((totalProducts - outOfStock) / totalProducts) * 100 : 0;
    
    const lowStockPercentage = (totalProducts > 0) ? 
      (lowStock / totalProducts) * 100 : 0;
    
    const outOfStockPercentage = (totalProducts > 0) ? 
      (outOfStock / totalProducts) * 100 : 0;

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalValue,
      stockPercentage: Math.round(stockPercentage),
      lowStockPercentage: Math.round(lowStockPercentage),
      outOfStockPercentage: Math.round(outOfStockPercentage),
    };
  }, [products]);

  const generatePDF = async () => {
    setGeneratingPDF(true);
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                padding: 40px;
                color: #2c3e50;
                line-height: 1.6;
              }
              h1 { 
                color: #2c3e50; 
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 10px;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
              }
              h2 {
                color: #34495e;
                font-size: 24px;
                margin-top: 30px;
                margin-bottom: 20px;
              }
              .date { 
                color: #7f8c8d; 
                font-size: 14px;
                margin-bottom: 40px;
              }
              .section { 
                margin-bottom: 40px;
                background: #fff;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              }
              .stats-grid { 
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 25px;
                margin-bottom: 30px;
              }
              .stat-card { 
                padding: 20px;
                background: #f8f9fa;
                border-radius: 12px;
                border-left: 4px solid #3498db;
              }
              .stat-value { 
                color: #2c3e50;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .stat-label { 
                color: #7f8c8d;
                font-size: 16px;
              }
              table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-top: 20px;
                border-radius: 8px;
                overflow: hidden;
              }
              th, td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ecf0f1;
              }
              th { 
                background-color: #3498db;
                color: white;
                font-weight: 600;
                font-size: 14px;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              tr:hover {
                background-color: #f1f3f4;
              }
            </style>
          </head>
          <body>
            <h1>Rapport des Stocks</h1>
            <div class="date">
              ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </div>
            
            <div class="section">
              <h2>Statistiques Générales</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${statistics?.totalProducts}</div>
                  <div class="stat-label">Produits Total</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.outOfStock}</div>
                  <div class="stat-label">Rupture de Stock</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.lowStock}</div>
                  <div class="stat-label">Stock Faible</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.totalValue?.toLocaleString()} DH</div>
                  <div class="stat-label">Valeur Totale</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Liste des Produits</h2>
              <table>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Prix (DH)</th>
                  <th>Stock</th>
                </tr>
                ${products?.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.type}</td>
                    <td>${product.price?.toLocaleString()}</td>
                    <td>${product.stocks?.[0]?.quantity || 0}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          </body>
        </html>
      `;

      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      const filename = `rapport_stocks_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          // Créer le fichier dans le dossier choisi par l'utilisateur
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            'application/pdf'
          );

          // Lire le contenu du PDF généré
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Écrire le contenu dans le nouveau fichier
          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            destinationUri,
            fileContent,
            { encoding: FileSystem.EncodingType.Base64 }
          );

          Alert.alert('Succès', 'Le PDF a été téléchargé');
        }
      } else {
        // Pour iOS
        const destinationUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri
        });
        Alert.alert('Succès', 'Le PDF a été enregistré');
      }

      // Supprimer le fichier temporaire
      await FileSystem.deleteAsync(uri);

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la génération du PDF',
        [{ text: 'OK' }]
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
              <MaterialIcons name="inventory" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>{statistics?.stockPercentage}% en stock</Text>
            </View>
          </View>
          <Text style={styles.statValue}>{statistics?.totalProducts}</Text>
          <Text style={styles.statLabel}>Produits Total</Text>
          <View style={styles.statProgress}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: statistics?.stockPercentage ? `${statistics.stockPercentage}%` : '0%',
                  backgroundColor: COLORS.primary 
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.danger}15` }]}>
              <MaterialIcons name="warning" size={24} color={COLORS.danger} />
            </View>
            <View style={[styles.statBadge, { backgroundColor: `${COLORS.danger}15` }]}>
              <Text style={[styles.statBadgeText, { color: COLORS.danger }]}>
                {statistics?.outOfStockPercentage}%
              </Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {statistics?.outOfStock}
          </Text>
          <Text style={styles.statLabel}>Rupture de Stock</Text>
          <View style={styles.statProgress}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: statistics?.outOfStockPercentage ? `${statistics.outOfStockPercentage}%` : '0%',
                  backgroundColor: COLORS.danger 
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.warning}15` }]}>
              <MaterialIcons name="low-priority" size={24} color={COLORS.warning} />
            </View>
            <View style={[styles.statBadge, { backgroundColor: `${COLORS.warning}15` }]}>
              <Text style={[styles.statBadgeText, { color: COLORS.warning }]}>
                {statistics?.lowStockPercentage}%
              </Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            {statistics?.lowStock}
          </Text>
          <Text style={styles.statLabel}>Stock Faible</Text>
          <View style={styles.statProgress}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: statistics?.lowStockPercentage ? `${statistics.lowStockPercentage}%` : '0%',
                  backgroundColor: COLORS.warning 
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.success}15` }]}>
              <MaterialIcons name="attach-money" size={24} color={COLORS.success} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {statistics?.totalValue.toLocaleString()} DH
          </Text>
          <Text style={styles.statLabel}>Valeur Totale</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={generatePDF}>
          <MaterialIcons name="file-download" size={24} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Rapport PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]}
      showsVerticalScrollIndicator={false}
    >
      <BlurView intensity={30} tint="dark" style={styles.statsContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistiques</Text>
          <Text style={styles.headerSubtitle}>Vue d'ensemble de votre inventaire</Text>
        </View>

        {renderOverviewTab()}
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendNegative: {
    backgroundColor: `${COLORS.danger}15`,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  statProgress: {
    height: 4,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});