import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types'; 

type NavigationProp = StackNavigationProp<RootStackParamList, 'Shop'>;

const Shop = () => {
  const navigation = useNavigation<NavigationProp>();

  const goToDetails = (item: RootStackParamList['Details']) => {
    navigation.navigate('Details', item);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Products</Text>

        <TouchableOpacity
          onPress={() =>
            goToDetails({ userId: '4',type: 'product', name: 'AR Glasses', price: 100, quantity: 1 })
          }
        >
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/images/img1.jpg')}
                style={styles.image}
              />
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.name}>AR Glasses</Text>
              <Text style={styles.price}>$100</Text>
              <Text style={styles.quantity}>1 available</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Subscriptions</Text>

        {[
          {
            name: 'Bronze',
            description: 'Basic features for casual users.',
            image: require('../assets/images/bronze.png'),
          },
          {
            name: 'Silver',
            description: 'Advanced features and support.',
            image: require('../assets/images/silver.png'),
          },
          {
            name: 'Gold',
            description: 'All features + premium support.',
            image: require('../assets/images/gold.png'),
          },
        ].map((sub) => (
          <TouchableOpacity
            key={sub.name}
            onPress={() =>
              goToDetails({
                userId: '4',
                type: 'subscription',
                name: sub.name,
                price: 100,
                description: sub.description,
              })
            }
          >
            <View style={styles.container}>
              <View style={styles.imageContainer}>
                <Image source={sub.image} style={styles.image} />
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.subscriptionTitle}>{sub.name}</Text>
                <Text style={styles.subscriptionDescription}>{sub.description}</Text>
                <Text style={styles.price}>$100</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    textAlign: 'center',
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
