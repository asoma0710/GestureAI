import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const UserProfile = ({ navigation, route }) => {
  const { username } = route.params;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://24.199.96.243:8000/Users/${username}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [username]);

  const HandleHome = () => {
    // Implement your logout logic here
    navigation.navigate('HomeScreen',{username:username}); // Navigate to Home screen after logout
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <View style={styles.userInfo}>
        <Text>Username: {userData?.username}</Text>
        <Text>Email: {userData?.email}</Text>
        {/* Add more user info here */}
      </View>
      <Button title="Home" onPress={HandleHome} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
});

export default UserProfile;