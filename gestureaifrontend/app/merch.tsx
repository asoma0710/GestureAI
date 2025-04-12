import React from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView } from 'react-native';

const Merch = ({ name = 'AR Glasses', price = 100.00, quantity = 1 }) => {
  return (
    <SafeAreaView style={{flex: 1}}>
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

    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
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
});

export default Merch;
