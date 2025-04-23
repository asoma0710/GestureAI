import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './types';

type DetailsRouteProp = RouteProp<RootStackParamList, 'Details'>;

const BASE_URL = "http://24.199.96.243:8000";

const Details = () => {
  const route = useRoute<DetailsRouteProp>();
  const { userId, name, price, quantity, description, type } = route.params;

  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      let subscriptionId: number = 5;
      let merchandiseId: number = 2;

      if (type === 'subscription') {
        const subsRes = await fetch(`${BASE_URL}/subscriptions`);
        const subs = await subsRes.json();
        const matchedSub = subs.find((s: any) => s.name === name);
        if (!matchedSub) throw new Error('Subscription plan not found.');
        subscriptionId = matchedSub.subscription_id;
      } else if (type === 'product') {
        const merchRes = await fetch(`${BASE_URL}/merchandise`);
        const merch = await merchRes.json();
      
        console.log("Fetched merchandise list:", merch.map((m: any) => m.name));
      
        const matchedMerch = merch.find(
          (m: any) => m.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
      
        if (!matchedMerch) {
          throw new Error(`Merchandise "${name}" not found.`);
        }
      
        if (matchedMerch.quantity <= 0) {
          throw new Error('Sold Out');
        }
      
        // Use correct key depending on your backend
        merchandiseId = matchedMerch.id ?? matchedMerch.merchandise_id;
      
        console.log("Matched Merchandise:", matchedMerch);
        console.log("Using merchandise ID:", merchandiseId);
      }
      

      const payload = {
        user_id: parseInt(userId),
        merchandise_id: merchandiseId,
        subscription_id: subscriptionId,
        final_price: price,
      };

      const purchaseRes = await fetch(`${BASE_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!purchaseRes.ok) {
        const errorText = await purchaseRes.text();
        throw new Error(`Failed to complete purchase. Payload: ${JSON.stringify(payload)}\nError: ${errorText}`);
      }

      if (subscriptionId) {
        const updateUserRes = await fetch(`${BASE_URL}/appusersupdate/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_plan: name }),
        });

        if (!updateUserRes.ok) {
          throw new Error('Purchase succeeded, but failed to update user subscription.');
        }
      }

      Alert.alert('Success', `${type === 'subscription' ? 'Subscription' : 'Product'} purchased!`);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const isSoldOut = quantity !== undefined && quantity <= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{type === 'product' ? 'Product' : 'Subscription'}</Text>

          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{name}</Text>

          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>${price.toFixed(2)}</Text>

          {quantity !== undefined && (
            <>
              <Text style={styles.label}>Quantity Available:</Text>
              <Text style={styles.value}>{isSoldOut ? 'Sold Out' : quantity}</Text>
            </>
          )}

          {description && (
            <>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{description}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isSoldOut && { backgroundColor: 'gray' }]}
          onPress={handlePurchase}
          disabled={loading || isSoldOut}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSoldOut ? 'Sold Out' : 'Buy Now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Details;
