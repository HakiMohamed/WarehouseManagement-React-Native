import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isCurrency?: boolean;
}

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',  // Dark background
  card: '#2D2D2D',       // Darker cards
  input: '#3D3D3D',      // Input background
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
};

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { products, fetchProducts } = useProduct();
  const [refreshing, setRefreshing] = React.useState(false);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    if (user?.warehouseId) {
      fetchProducts(user.warehouseId);
    }
  }, [user]);

  useEffect(() => {
    if (products) {
      const stats = calculateStatistics(products);
      setStatistics(stats);
    }
  }, [products]);

  const calculateStatistics = (products: Product[]) => {
    return {
      totalProducts: products.length,
      outOfStock: products.filter(product => 
        product.stocks?.every(stock => stock.quantity === 0)
      ).length,
      totalStockValue: products.reduce((total, product) => {
        const stockQuantity = product.stocks?.reduce((sum, stock) => sum + (stock.quantity || 0), 0) || 0;
        return total + (stockQuantity * (product.price || 0));
      }, 0),
      lowStock: products.filter(product => 
        product.stocks?.some(stock => 
          stock.quantity > 0 && 
          stock.quantity <= (product.minQuantity || 0)
        )
      ).length
    };
  };

  const onRefresh = React.useCallback(async () => {
    if (!user?.warehouseId) return;
    setRefreshing(true);
    await fetchProducts(user.warehouseId);
    setRefreshing(false);
  }, [user]);

  // Produits en rupture de stock
  const outOfStockProducts = products ? products.filter((product: Product) => 
    product.stocks?.every(stock => stock.quantity === 0)
  ) : [];

  // Produits en stock faible (mais pas en rupture)
  const lowStockProducts = products ? products.filter((product: Product) => 
    product.stocks?.some(stock => 
      stock.quantity > 0 && 
      stock.quantity <= (product.minQuantity || 0)
    )
  ) : [];

  const StatCard = ({ title, value, icon, color, isCurrency }: StatCardProps) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>
          {isCurrency 
            ? `${value.toLocaleString()} DH`
            : value.toLocaleString()}
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const ProductList = ({ products, title }: { products: Product[], title: string }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.seeAllButton}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {products.length > 0 ? (
        products.slice(0, 3).map((product) => (
          <TouchableOpacity 
            key={product.id}
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[
                styles.productStock,
                product.stocks?.[0]?.quantity === 0 ? styles.outOfStockText : styles.lowStockText
              ]}>
                Stock: {product.stocks?.[0]?.quantity || 0} 
                {product.minQuantity ? ` / Min: ${product.minQuantity}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun produit dans cette catégorie</Text>
        </View>
      )}
    </View>
  );

  const quickActions = [
    {
      icon: 'scan-circle',
      title: 'Scanner',
      desc: 'Scanner un produit',
      color: '#FF4500',
      onPress: () => navigation.navigate('Scanner')
    },
    {
      icon: 'add-circle',
      title: 'Ajouter',
      desc: 'Nouveau produit',
      color: '#FF4500',
      onPress: () => navigation.navigate('AddProduct', { barcode: undefined })
    },
    {
      icon: 'search-circle',
      title: 'Rechercher',
      desc: 'Trouver un produit',
      color: '#FF4500',
      onPress: () => navigation.navigate('Products')
    },
  ];

  const features = [
    {
      icon: 'barcode-outline',
      title: 'Scan Intelligent',
      description: 'Scannez et identifiez rapidement vos produits'
    },
    {
      icon: 'analytics-outline',
      title: 'Suivi en Temps Réel',
      description: 'Visualisez vos stocks et statistiques instantanément'
    },
    {
      icon: 'notifications-outline',
      title: 'Alertes Stock',
      description: 'Soyez notifié des ruptures et stocks faibles'
    }
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: COLORS.textSecondary }]}>Bonjour,</Text>
          <Text style={[styles.userName, { color: COLORS.white }]}>{user?.name}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.scanButton, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('ScanTab')}
        >
          <Ionicons name="qr-code" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={[styles.descriptionCard, { backgroundColor: COLORS.card }]}>
        <View style={[styles.descriptionIcon, { backgroundColor: COLORS.input }]}>
          <Ionicons name="cube" size={32} color={COLORS.primary} />
        </View>
        <Text style={[styles.descriptionTitle, { color: COLORS.white }]}>
          Gestion de Stock Intelligente
        </Text>
        <Text style={[styles.descriptionText, { color: COLORS.textSecondary }]}>
          Simplifiez votre gestion d'inventaire avec une solution moderne et intuitive
        </Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: COLORS.primary }]}>
                <Ionicons name={feature.icon} size={24} color={COLORS.white} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: COLORS.white }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: COLORS.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.actionCard, { backgroundColor: COLORS.card }]}
            onPress={action.onPress}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: COLORS.primary }]}>
              <Ionicons name={action.icon} size={32} color={COLORS.white} />
            </View>
            <Text style={[styles.actionTitle, { color: COLORS.white }]}>
              {action.title}
            </Text>
            <Text style={[styles.actionDesc, { color: COLORS.textSecondary }]}>
              {action.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeCardTitle}>Comment démarrer ?</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Ajoutez vos premiers produits</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Gérez vos stocks facilement</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Suivez vos performances</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: COLORS.white }]}>
              {statistics.totalProducts}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>
              Produits
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: COLORS.white }]}>
              {statistics.totalStockValue.toLocaleString()} DH
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>
              Valeur totale
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <Ionicons name="warning-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: COLORS.white }]}>
              {statistics.lowStock}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>
              Stock faible
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.card }]}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: COLORS.white }]}>
              {statistics.outOfStock}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>
              Rupture
            </Text>
          </View>
        </View>
      </View>

      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <View style={[styles.alertsSection, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.alertsTitle, { color: COLORS.white }]}>Alertes</Text>
          {outOfStockProducts.length > 0 && (
            <View style={[styles.section, { backgroundColor: COLORS.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: COLORS.white }]}>
                  Rupture de stock
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                  <Text style={[styles.seeAllButton, { color: COLORS.primary }]}>
                    Voir tout
                  </Text>
                </TouchableOpacity>
              </View>
              {outOfStockProducts.slice(0, 3).map((product) => (
                <TouchableOpacity 
                  key={product.id}
                  style={[styles.productItem, { borderBottomColor: COLORS.input }]}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: COLORS.white }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.outOfStockText}>
                      Stock: {product.stocks?.[0]?.quantity || 0} 
                      {product.minQuantity ? ` / Min: ${product.minQuantity}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {lowStockProducts.length > 0 && (
            <View style={[styles.section, { backgroundColor: COLORS.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: COLORS.white }]}>
                  Stock faible
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                  <Text style={[styles.seeAllButton, { color: COLORS.primary }]}>
                    Voir tout
                  </Text>
                </TouchableOpacity>
              </View>
              {lowStockProducts.slice(0, 3).map((product) => (
                <TouchableOpacity 
                  key={product.id}
                  style={[styles.productItem, { borderBottomColor: COLORS.input }]}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: COLORS.white }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.lowStockText}>
                      Stock: {product.stocks?.[0]?.quantity || 0} 
                      {product.minQuantity ? ` / Min: ${product.minQuantity}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  featuresContainer: {
    marginTop: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  descriptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  outOfStockText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  lowStockText: {
    color: '#FF9500',
    fontWeight: '500',
  },
  alertsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  welcomeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
