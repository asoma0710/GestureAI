import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import SignInScreen from './screens/SignIn';
import SignUpScreen from './screens/SignUp';
import SearchScreen from './screens/SearchScreen';
import CameraScreen from './screens/CameraScreen';


import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import 'react-native-gesture-handler';
import { LogBox } from 'react-native';

// Suppress all log notifications
LogBox.ignoreAllLogs();

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user_name, setuser_name] = useState('Suny');

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'SignIn') {
              iconName = 'log-in';
            } else if (route.name === 'SignUp') {
              iconName = 'person-add';
            } else if (route.name === 'Search') {
              iconName = 'search';
            } else if (route.name === 'Location') {
              iconName = 'locate';
            } else if (route.name === 'Chat') {
              iconName = 'chatbubbles';
            } else if (route.name=='Camera'){
              iconName= 'camera'
            }else if(route.name=='Gallery'){

              iconName='images'
            }

            return (
              <Ionicons
                name={iconName}
                size={focused ? size * 1.2 : size}
                color={color}
                style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}
              />
            );
          },
          tabBarActiveTintColor: '#7d1aff',
          tabBarInactiveTintColor: '#b880ff',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#7d1aff',
          },
          tabBarItemStyle: {
            paddingTop: 5,
          },
          tabBarStyle: {
            display: 'flex',
            backgroundColor: '#87CEEB',
          },
        })}
      >
        {!isLoggedIn ? (
          <>
            <Tab.Screen
              name="Home"
              options={{ tabBarLabel: 'Home', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            >
              {(props) => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} user_name={user_name} />}
            </Tab.Screen>
  
            <Tab.Screen
              name="SignIn"
              options={{ tabBarLabel: 'Sign In', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            >
              {(props) => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} setuser_name={setuser_name} />}
            </Tab.Screen>

            <Tab.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ tabBarLabel: 'Sign Up', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Home"
              options={{ tabBarLabel: 'Home', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            >
              {(props) => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} user_name={user_name} />}
            </Tab.Screen>
            <Tab.Screen
              name="Search"
              component={SearchScreen}
              options={{ tabBarLabel: 'Search', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            />
            <Tab.Screen
              name="Location"
              component={LocationScreen}
              options={{ tabBarLabel: 'Location', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            />

            <Tab.Screen
              name="Chat"
              options={{ tabBarLabel: 'Chat', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            >
              {(props) => <ChatScreen {...props}  user_name={user_name} />}
            </Tab.Screen>
            <Tab.Screen
              name="Camera"
              component={CameraScreen}
              options={{ tabBarLabel: 'Camera', headerShown: true, headerStyle: { backgroundColor: '#87CEEB' } }}
            />
            <Tab.Screen
               name="Gallery"
               component={ImageGalleryScreen}
               options={{ tabBarLabel: 'Gallery',headerShown: true,headerStyle: { backgroundColor: '#87CEEB' }}}
/>

          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}