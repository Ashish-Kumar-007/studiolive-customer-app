import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { ArrowLeft, Package } from 'lucide-react-native';
import { FloatingCart } from '../../../src/components/FloatingCart';

const PRODUCTS = [
  { id: 'prod_1', name: 'Premium Leather Album', price: 15000, description: '12x12 inch, 40 pages, genuine leather cover.' },
  { id: 'prod_2', name: 'Acrylic Wall Frame', price: 8500, description: '24x36 inch frameless acrylic mount.' },
  { id: 'prod_3', name: 'Coffee Table Photobook', price: 5000, description: '10x10 inch layflat photobook.' },
  { id: 'prod_4', name: 'Canvas Print Set', price: 12000, description: 'Set of 3 (16x24 inch) stretched canvas prints.' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { addItem, incrementQuantity, decrementQuantity, getItemQuantity } = useCartStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio Products</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Package size={24} color={Colors.success} />
          <Text style={styles.bannerText}>Elevate your memories with premium physical products delivered to your door.</Text>
        </View>

        {PRODUCTS.map(product => {
          const qty = getItemQuantity(product.id);
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>{product.description}</Text>
                <Text style={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</Text>
              </View>
              
              <View style={styles.actionContainer}>
                {qty === 0 ? (
                  <TouchableOpacity style={styles.addButton} onPress={() => addItem(product)}>
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.counterContainer}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => decrementQuantity(product.id)}>
                      <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{qty}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => incrementQuantity(product.id)}>
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <FloatingCart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.success + '15', padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.xl, gap: 12 },
  bannerText: { flex: 1, color: Colors.success, fontSize: 13, fontWeight: '600' },
  productCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  productInfo: { flex: 1, paddingRight: Spacing.md },
  productName: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  productDesc: { fontSize: 12, color: Colors.textDim, marginBottom: 8, lineHeight: 18 },
  productPrice: { fontSize: 15, fontWeight: '800', color: Colors.text },
  actionContainer: { width: 80, height: 36 },
  addButton: { flex: 1, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.info, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: Colors.info, fontWeight: '800', fontSize: 13 },
  counterContainer: { flex: 1, flexDirection: 'row', backgroundColor: Colors.info, borderRadius: Radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'space-between' },
  counterBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  counterBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  counterValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
