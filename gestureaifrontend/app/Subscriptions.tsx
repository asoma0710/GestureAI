import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';

const plans = [
  { label: '1', type: 'Monthly', price: 0.5 },
  { label: '12', type: 'Yearly', price: 2.55, popular: true },
  { label: '∞', type: 'Lifetime', price: 50 },
];

const SubscriptionPage = () => {
  const [selected, setSelected] = useState('Yearly');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Get Premium</Text>
        <Text style={styles.subtitle}>Get All The New Exciting Features</Text>

        <Image
          source={require('../assets/images/sub.jpg')} // replace with your asset
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.featureTitle}>Secure</Text>
        <Text style={styles.featureDesc}>
          Transfer obfuscate traffic via{'\n'}encrypted tunnel
        </Text>

        <View style={styles.planRow}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.type}
              onPress={() => setSelected(plan.type)}
              style={[
                styles.planCard,
                selected === plan.type && styles.selectedCard,
              ]}
            >
              {plan.popular && <Text style={styles.popular}>MOST POPULAR</Text>}
              <Text style={styles.planLabel}>{plan.label}</Text>
              <Text style={styles.planType}>{plan.type}</Text>
              <Text style={styles.planPrice}>${plan.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf3fb',
  },
  container: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: '#7d9cb1',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureDesc: {
    textAlign: 'center',
    color: '#555',
    marginTop: 4,
    marginBottom: 20,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  planCard: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: 90,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#0b85ff',
  },
  popular: {
    backgroundColor: '#0b85ff',
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  planLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planType: {
    fontSize: 12,
    color: '#666',
  },
  planPrice: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  buyButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 30,
    marginTop: 30,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
