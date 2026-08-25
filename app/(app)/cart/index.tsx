import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import Button from '../../../src/components/AppButton';

export default function CartScreen() {
  const router = useRouter();
  const { items, getCartTotal, incrementQuantity, decrementQuantity, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18;
  const delivery = subtotal > 0 ? 500 : 0;
  const total = subtotal + tax + delivery;

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      clearCart();
    }, 2000);
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
        <CheckCircle size={80} color={Colors.success} style={{ marginBottom: Spacing.xl }} />
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successDesc}>Your physical products have been ordered successfully. They will be delivered within 7-10 working days.</Text>
        <Button title="Back to Home" onPress={() => router.replace('/')} style={{ width: '100%', marginTop: Spacing.xxl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <>
            <View style={styles.itemsContainer}>
              {items.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => decrementQuantity(item.id)}>
                      <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => incrementQuantity(item.id)}>
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.billContainer}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{delivery}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes (18% GST)</Text>
                <Text style={styles.billValue}>₹{tax.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payButton} onPress={handleCheckout} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Checkout</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  content: { padding: Spacing.lg },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textDim, fontSize: 16 },
  itemsContainer: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  itemPrice: { fontSize: 14, color: Colors.textDim, fontWeight: '600' },
  counterContainer: { flexDirection: 'row', backgroundColor: Colors.info, borderRadius: Radius.md, width: 80, height: 32, alignItems: 'center', justifyContent: 'space-between' },
  counterBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  counterBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  counterValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
  billContainer: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  billTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  billLabel: { fontSize: 13, color: Colors.textDim },
  billValue: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
  totalValue: { fontSize: 16, fontWeight: '900', color: Colors.text },
  footer: { padding: Spacing.lg, backgroundColor: Colors.surface, borderTopWidth: 1, borderColor: Colors.border },
  payButton: { backgroundColor: Colors.info, height: 56, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  successTitle: { fontSize: 28, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md },
  successDesc: { fontSize: 15, color: Colors.textDim, textAlign: 'center', lineHeight: 24 },
});
