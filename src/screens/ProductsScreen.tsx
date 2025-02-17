import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Searchbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { debounce } from 'lodash';
import { BlurView } from 'expo-blur';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      styles.filterChip,
      selected && styles.filterChipSelected
    ]}
  >
    <Text style={[
      styles.filterChipText,
      selected && styles.filterChipTextSelected
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ITEMS_PER_PAGE = 5;

const COLORS = {
  primary: '#FF4500',
  background: '#1A1A1A',
  card: '#2D2D2D',
  input: '#3D3D3D',
  white: '#FFFFFF',
  textSecondary: '#9A9A9A',
  border: '#3D3D3D',
};

export const ProductsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { products, fetchProducts, loading } = useProduct();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique product types from products
  const productTypes = ['all', ...new Set(products?.map(p => p.type) || [])];

  useEffect(() => {
    if (user?.warehouseId) {
      loadProducts();
    }
  }, [user?.warehouseId]);

  useEffect(() => {
    filterProducts();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, selectedType, products]);

  const loadProducts = async () => {
    try {
      if (user?.warehouseId) {
        await fetchProducts(user.warehouseId);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = [...(products || [])];

    // Sort products by latest edited date first
    filtered.sort((a, b) => {
      const dateA = new Date(a.editedBy?.[a.editedBy.length - 1]?.at || 0);
      const dateB = new Date(b.editedBy?.[b.editedBy.length - 1]?.at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    setFilteredProducts(filtered);
  };

  const debouncedSearch = debounce((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  }, 300);

  const loadMore = () => {
    if (filteredProducts.length < (products?.length || 0)) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <View style={styles.productContent}>
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cube-outline" size={30} color={COLORS.primary} />
              </View>
            )}
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.headerInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name || 'Sans nom'}
              </Text>
              <Text style={styles.productPrice}>
                {item.price ? `${item.price} DH` : 'Prix non défini'}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stockInfo}>
                <View style={styles.stockBadge}>
                  <Ionicons name="cube" size={16} color={COLORS.primary} />
                  <Text style={styles.stockText}>
                    {item.stocks?.[0]?.quantity || 0}
                  </Text>
                </View>

                {item.stocks?.[0]?.minQuantity && (
                  <View style={[styles.stockBadge, styles.minStockBadge]}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.stockText}>
                      Min: {item.stocks?.[0]?.minQuantity}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.typeContainer}>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredCount = filteredProducts.length;
    return Math.ceil(filteredCount / ITEMS_PER_PAGE);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(getTotalPages(), prev + 1));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Pagination controls
  const PaginationControls = () => {
    const totalPages = getTotalPages();
    
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const showEllipsisStart = currentPage > 3;
      const showEllipsisEnd = currentPage < totalPages - 2;

      if (totalPages <= 5) {
        // Show all pages if total is 5 or less
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (showEllipsisStart) {
          pages.push('...');
        }

        // Show current page and surrounding pages
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }

        if (showEllipsisEnd) {
          pages.push('...');
        }

        // Always show last page
        if (!pages.includes(totalPages)) {
          pages.push(totalPages);
        }
      }

      return pages.map((page, index) => {
        if (page === '...') {
          return (
            <View key={`ellipsis-${index}`} style={styles.ellipsis}>
              <Text style={styles.ellipsisText}>•••</Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              currentPage === page && styles.activePageButton,
            ]}
            onPress={() => setCurrentPage(page as number)}
          >
            <Text style={[
              styles.pageButtonText,
              currentPage === page && styles.activePageButtonText,
            ]}>
              {page}
            </Text>
          </TouchableOpacity>
        );
      });
    };

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.arrowButton, currentPage === 1 && styles.arrowButtonDisabled]}
          onPress={handlePrevPage}
          disabled={currentPage === 1}
        >
          <MaterialIcons 
            name="chevron-left" 
            size={24} 
            color={currentPage === 1 ? COLORS.textSecondary : COLORS.primary} 
          />
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {renderPageNumbers()}
        </View>

        <TouchableOpacity 
          style={[styles.arrowButton, currentPage === totalPages && styles.arrowButtonDisabled]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={currentPage === totalPages ? COLORS.textSecondary : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <BlurView intensity={80} tint="dark" style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { backgroundColor: COLORS.input }]}>
            <MaterialIcons name="search" size={24} color={COLORS.primary} />
            <TextInput
              placeholder="Rechercher un produit..."
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.searchInput, { color: COLORS.white }]}
              onChangeText={debouncedSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  debouncedSearch('');
                }}
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <MaterialIcons 
              name="tune" 
              size={24} 
              color={showFilters ? COLORS.white : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filtrer par catégorie</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedType === 'all' && styles.categoryChipActive
                ]}
                onPress={() => setSelectedType('all')}
              >
                <View style={styles.chipIconContainer}>
                  <Ionicons 
                    name="apps" 
                    size={18} 
                    color={selectedType === 'all' ? COLORS.white : COLORS.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.categoryChipText,
                  selectedType === 'all' && styles.categoryChipTextActive
                ]}>
                  Tous
                </Text>
              </TouchableOpacity>
              
              {productTypes
                .filter(type => type !== 'all')
                .map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.categoryChip,
                      selectedType === type && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <View style={styles.chipIconContainer}>
                      <Ionicons 
                        name="cube-outline" 
                        size={18} 
                        color={selectedType === type ? COLORS.white : COLORS.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryChipText,
                      selectedType === type && styles.categoryChipTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          </View>
        )}
      </BlurView>

      <FlatList
        data={getCurrentPageItems()}
        renderItem={renderItem}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucun produit disponible'}
            </Text>
          </View>
        }
        ListFooterComponent={<PaginationControls />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  productItem: {
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: `${COLORS.primary}10`,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
  },
  mainInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  minStockBadge: {
    backgroundColor: `${COLORS.primary}15`,
  },
  stockText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  typeContainer: {
    backgroundColor: COLORS.input,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.white,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingRight: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
  },
  arrowButtonDisabled: {
    backgroundColor: COLORS.input,
    opacity: 0.5,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: COLORS.input,
  },
  activePageButton: {
    backgroundColor: COLORS.primary,
  },
  pageButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activePageButtonText: {
    color: COLORS.white,
  },
  ellipsis: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
}); 