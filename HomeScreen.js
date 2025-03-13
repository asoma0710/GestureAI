import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const HomeScreen = ({ setIsLoggedIn, isLoggedIn, user_name }) => {
  const [userData, setUserData] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://24.199.96.243:8000/Users/${user_name}`);

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
  }, [user_name]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDrawer(false);
  };

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handlePlaybackStatusUpdate = (playbackStatus) => {
    if (playbackStatus.didJustFinish) {
      videoRef.current.replayAsync();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={closeDrawer}>
      <View style={styles.container}>
        {isLoggedIn && (
          <TouchableOpacity onPress={toggleDrawer} style={styles.toggleButton}>
            <Ionicons name="menu-outline" size={24} color="black" />
          </TouchableOpacity>
        )}

        {showDrawer && (
          <DrawerContentScrollView style={styles.drawer} contentContainerStyle={styles.drawerContent}>
            <View style={styles.profileContainer}>
              <Ionicons name="person-circle-outline" size={50} color="blue" />
              <Image source={{ uri: userData?.profileImageUrl }} style={styles.profileImage} />
              <Text style={styles.username}>{userData?.username}</Text>
              <Text style={styles.email}>{userData?.email}</Text>
            </View>
            <DrawerItem
              label="Logout"
              onPress={handleLogout}
              icon={({ color, size }) => <Ionicons name="log-out" size={size} color={color} />}
              labelStyle={{ fontWeight: 'bold', color: 'red' }}
            />
          </DrawerContentScrollView>
        )}

        <Video
          ref={videoRef}
          source={{ uri: 'https://your-video-url.com/video.mp4' }}
          style={styles.backgroundVideo}
          muted={true}
          repeat={true}
          rate={1.0}
          resizeMode="cover"
          shouldPlay={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
        <View style={styles.overlay}>
          <Text style={styles.welcomeText}>Welcome to Candy Land</Text>
        </View>

        {!isLoggedIn && (
          <View style={styles.signInTextContainer}>
            <Text style={styles.signInText}>Ready for a Sweet Adventure? Sign in!</Text>
          </View>
        )}

        {isLoggedIn && (
          <View style={styles.signInTextContainer}>
            <Text style={styles.signedInText}>Go to the Search page and discover some candy delights!</Text>
          </View>
        )}

        <View style={styles.iconContainer}>
          {[
            "https://storage.googleapis.com/tagjs-prod.appspot.com/K5Sb442fxk/rgnqeir8.png",
            "https://storage.googleapis.com/tagjs-prod.appspot.com/K5Sb442fxk/bsw6ip10.png",
            "https://storage.googleapis.com/tagjs-prod.appspot.com/K5Sb442fxk/lc6b482z.png",
            "https://storage.googleapis.com/tagjs-prod.appspot.com/K5Sb442fxk/lx23id8k.png",
            "https://storage.googleapis.com/tagjs-prod.appspot.com/K5Sb442fxk/xaz8slyt.png",
          ].map((uri, index) => (
            <TouchableOpacity key={index} style={styles.iconButton}>
              <Image source={{ uri }} style={styles.iconImage} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 36,
    color: 'pink',
    fontWeight: 'bold',
    position: 'absolute',
    top: '15%',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  iconButton: {
    padding: 10,
  },
  iconImage: {
    width: 45,
    height: 40,
  },
});

export default HomeScreen;
