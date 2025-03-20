// Import React and hooks for state and effect management.
import React, { useState, useEffect } from "react";
// Import basic React Native components.
import { View, ActivityIndicator } from "react-native";
// Import createBottomTabNavigator from React Navigation for tab navigation.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Import Ionicons from Expo for tab icons.
import { Ionicons } from "@expo/vector-icons";

// Import all screens used in the app.
import SignIn from "./signin";
import SignUp from "./signup";
import Home from "./home";
import Shop from "./shop";
import Account from "./account";
import Learn from "./learn";

// ----------------------------------------------------------------
// Define a TypeScript type for the bottom tab routes (the route param list).
// Each key represents a route name and the value defines the parameters for that route.
// In this case, no route expects any parameters (undefined).
// ----------------------------------------------------------------
export type RootTabParamList = {
  Home: undefined;
  Shop: undefined;
  Account: undefined;
  Learn: undefined;
};

// Create a Bottom Tab Navigator instance typed with the route parameter list.
const Tab = createBottomTabNavigator<RootTabParamList>();

// ----------------------------------------------------------------
// AppNavigator Component
// This component renders the bottom tab navigator with its screens.
// It receives two props:
//   - userId: the currently logged-in user's ID (or null if not logged in)
//   - onLogout: a function to call when the user signs out
// ----------------------------------------------------------------
function AppNavigator({
  userId,
  onLogout,
}: {
  userId: string | null;
  onLogout: () => void;
}) {
  return (
    <Tab.Navigator
      // Configure tab navigator screen options.
      screenOptions={{
        headerShown: false,                  // Do not show the header at the top of each screen.
        tabBarActiveTintColor: "#3F6E57",      // Color of the active tab icon.
        tabBarInactiveTintColor: "gray",       // Color of inactive tab icons.
      }}
    >
      {/* Home screen tab */}
      <Tab.Screen
        name="Home"                           // Route name: "Home".
        options={{
          // Define the icon for the Home tab.
          tabBarIcon: ({ focused, color, size }) => {
            // If the tab is focused, use the filled home icon; otherwise, use the outline.
            const iconName = focused ? "home" : "home-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      >
        {/* Render the Home component and pass the userId prop */}
        {(props) => <Home {...props} userId={userId} />}
      </Tab.Screen>

      {/* Shop screen tab */}
      <Tab.Screen
        name="Shop"                           // Route name: "Shop".
        options={{
          // Define the icon for the Shop tab.
          tabBarIcon: ({ focused, color, size }) => {
            // If focused, use the filled cart icon; otherwise, the outline version.
            const iconName = focused ? "cart" : "cart-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      >
        {/* Render the Shop component with the userId prop */}
        {(props) => <Shop {...props} userId={userId} />}
      </Tab.Screen>

      {/* Account screen tab */}
      <Tab.Screen
        name="Account"                        // Route name: "Account".
        options={{
          // Define the icon for the Account tab.
          tabBarIcon: ({ focused, color, size }) => {
            // If focused, use the filled person icon; otherwise, the outline version.
            const iconName = focused ? "person" : "person-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      >
        {/* Render the Account component and pass both userId and onLogout props */}
        {(props) => (
          <Account {...props} userId={userId} onLogout={onLogout} />
        )}
      </Tab.Screen>

      {/* Learn screen tab */}
      <Tab.Screen
        name="Learn"                          // Route name: "Learn".
        options={{
          // Define the icon for the Learn tab.
          tabBarIcon: ({ focused, color, size }) => {
            // If focused, use the filled book icon; otherwise, the outline.
            const iconName = focused ? "book" : "book-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      >
        {/* Render the Learn component with the userId prop */}
        {(props) => <Learn {...props} userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ----------------------------------------------------------------
// AppContainer Component
// This is the main container component that manages authentication
// and decides which screen to render based on the user's login state.
// ----------------------------------------------------------------
export default function AppContainer() {
  // State variable to track if the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // State variable to store the logged-in user's ID; null if not logged in.
  const [userId, setUserId] = useState<string | null>(null);
  // State variable to manage which screen to display: Splash, SignIn, or SignUp.
  const [currentScreen, setCurrentScreen] = useState<"Splash" | "SignIn" | "SignUp">("Splash");

  // useEffect hook to simulate a splash screen delay.
  // After 2 seconds, the app transitions from the splash screen to the SignIn screen.
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("SignIn");
    }, 2000);
    // Clear the timer when the component unmounts.
    return () => clearTimeout(timer);
  }, []);

  // Callback function invoked when the SignIn screen reports a successful login.
  // It sets the login state to true and saves the user ID.
  const handleLoginSuccess = (loggedInUserId: string) => {
    setIsLoggedIn(true);
    setUserId(loggedInUserId);
  };

  // Callback function invoked when the user signs out (from the Account screen).
  // It resets the login state and navigates back to the SignIn screen.
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentScreen("SignIn");
  };

  // If the current screen is still the splash screen, show a loading spinner.
  if (currentScreen === "Splash") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Conditional rendering:
  // If the user is logged in, render the AppNavigator (bottom tabs).
  // Otherwise, render either the SignIn or SignUp screen based on the currentScreen state.
  return isLoggedIn ? (
    // When logged in, show the bottom tab navigator with all main screens.
    <AppNavigator userId={userId} onLogout={handleLogout} />
  ) : currentScreen === "SignIn" ? (
    // When not logged in and currentScreen is SignIn, show the SignIn screen.
    <SignIn navigate={setCurrentScreen} onLoginSuccess={handleLoginSuccess} />
  ) : (
    // Otherwise, show the SignUp screen.
    <SignUp navigate={setCurrentScreen} />
  );
}
