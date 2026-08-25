import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import { Colors, Spacing, Radius } from '../constants/theme';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';

export function FloatingCart() {
  const { getItemCount, getCartTotal } = useCartStore();
  const router = useRouter();
  const count = getItemCount();
  const total = getCartTotal();

  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.cartBanner}
        activeOpacity={0.9}
        onPress={() => router.push('/cart')}
      >
        <View style={styles.left}>
          <View style={styles.iconWrapper}>
            <ShoppingBag size={20} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.totalText}>₹{total.toLocaleString('en-IN')}</Text>
            <Text style={styles.subText}>Plus taxes</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ChevronRight size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  cartBanner: {
    backgroundColor: Colors.info,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.admin,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.info,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  subText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
});
