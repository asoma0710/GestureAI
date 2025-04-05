// AppContainer.tsx
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import your screens
import SignIn from "./signin";
import SignUp from "./signup";
import Home from "./home";
import Shop from "./shop";
import Account from "./account";
import EditProfile from "./editprofile";
import Learn from "./learn";
import ChangePassword from "./changepassword";


export type RootTabParamList = {
  Home: undefined;
  Shop: undefined;
  AccountStack: undefined;
  Learn: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Define the Account stack parameter list.
export type AccountStackParamList = {
  AccountMain: undefined;
  EditProfile: { userId: string };
};

const AccountStack = createStackNavigator<AccountStackParamList>();

// In AppContainer.tsx (update AccountNavigator)
function AccountNavigator({
  userId,
  onLogout,
}: {
  userId: string;
  onLogout: () => void;
}) {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountMain">
        {(props) => <Account {...props} userId={userId} onLogout={onLogout} />}
      </AccountStack.Screen>
      <AccountStack.Screen name="EditProfile" component={EditProfile} />
      <AccountStack.Screen name="ChangePassword" component={ChangePassword} />
    </AccountStack.Navigator>
  );
}


function AppNavigator({
  userId,
  onLogout,
}: {
  userId: string;
  onLogout: () => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3F6E57",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? "home" : "home-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Shop"
        component={Shop}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? "cart" : "cart-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="AccountStack"
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? "person" : "person-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      >
        {() => <AccountNavigator userId={userId} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Learn"
        component={Learn}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? "book" : "book-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<
    "Splash" | "SignIn" | "SignUp"
  >("Splash");

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("SignIn");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (loggedInUserId: string) => {
    setIsLoggedIn(true);
    setUserId(loggedInUserId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentScreen("SignIn");
  };

  if (currentScreen === "Splash") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Removed the NavigationContainer wrapper.
  return (
    <>
      {isLoggedIn && userId ? (
        <AppNavigator userId={userId} onLogout={handleLogout} />
      ) : currentScreen === "SignIn" ? (
        <SignIn navigate={setCurrentScreen} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <SignUp navigate={setCurrentScreen} />
      )}
    </>
  );
}
