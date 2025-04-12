import React from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const Shop = ({ name = 'AR Glasses', price = 100.0, quantity = 1 }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Products Section */}
        <Text style={styles.sectionTitle}>Products</Text>

        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/img1.jpg')}
              style={styles.image}
            />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.price}>${price}</Text>
            <Text style={styles.quantity}>{quantity} available</Text>
          </View>
        </View>

        {/* Subscriptions Section */}
        <Text style={styles.sectionTitle}>Subscriptions</Text>

        <View style={styles.subscriptionBox}>
          <Text style={styles.subscriptionTitle}>Silver</Text>
          <Text style={styles.subscriptionDescription}>Basic features for casual users.</Text>
        </View>

        <View style={styles.subscriptionBox}>
          <Text style={styles.subscriptionTitle}>Gold</Text>
          <Text style={styles.subscriptionDescription}>Advanced features and support.</Text>
        </View>

        <View style={styles.subscriptionBox}>
          <Text style={styles.subscriptionTitle}>Platinum</Text>
          <Text style={styles.subscriptionDescription}>All features + premium support.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
  },
  detailsContainer: {
    flex: 2,
    marginLeft: 20,
  },
  name: {
    fontSize: 18,
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  quantity: {
    fontSize: 14,
    color: '#999',
  },
  subscriptionBox: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default Shop;
