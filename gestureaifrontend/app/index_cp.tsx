// File: index.tsx
import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import SignIn from "./signin";
import SignUp from "./signup";
import Home from "./home";
import Shop from "./shop";
import Account from "./account";
import Learn from "./learn";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// ----- Define the Bottom Tab Navigator inline -----
const Tab = createBottomTabNavigator();
function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,  // <-- Hide the header
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
        name="Account"
        component={Account}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? "person" : "person-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
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

// ----- OOP Screen Management -----

abstract class BaseScreen {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  abstract render(): React.ReactNode;
}

// SplashScreen displays the logo
class SplashScreen extends BaseScreen {
  imageSource: ImageSourcePropType;
  constructor(name: string, imageSource: ImageSourcePropType) {
    super(name);
    this.imageSource = imageSource;
  }
  render() {
    return (
      <View style={styles.container}>
        <Image source={this.imageSource} style={styles.logo} />
      </View>
    );
  }
}

// Wrapper for SignIn screen
class SignInScreenWrapper extends BaseScreen {
  navigate: (screenName: string) => void;
  constructor(navigate: (screenName: string) => void) {
    super("SignIn");
    this.navigate = navigate;
  }
  render() {
    return <SignIn navigate={this.navigate} />;
  }
}

// Wrapper for SignUp screen
class SignUpScreenWrapper extends BaseScreen {
  navigate: (screenName: string) => void;
  constructor(navigate: (screenName: string) => void) {
    super("SignUp");
    this.navigate = navigate;
  }
  render() {
    return <SignUp navigate={this.navigate} />;
  }
}

// Wrapper for BottomNavigator (the bottom tab navigator)
class AppNavigatorWrapper extends BaseScreen {
  navigate: (screenName: string) => void;
  constructor(navigate: (screenName: string) => void) {
    super("AppNavigator");
    this.navigate = navigate;
  }
  render() {
    return <BottomNavigator />;
  }
}

// ScreenManager to manage screens
class ScreenManager {
  screens: BaseScreen[];
  constructor() {
    this.screens = [];
  }
  addScreen(screen: BaseScreen): void {
    this.screens.push(screen);
  }
  getScreenByName(name: string): BaseScreen | undefined {
    return this.screens.find((screen) => screen.name === name);
  }
}

interface GestureAIAppState {
  currentScreen: string;
}

// Root component
export default class GestureAIApp extends React.Component<{}, GestureAIAppState> {
  screenManager: ScreenManager;
  splashScreen: SplashScreen;
  signInScreen: SignInScreenWrapper;
  signUpScreen: SignUpScreenWrapper;
  appNavigatorScreen: AppNavigatorWrapper;

  constructor(props: {}) {
    super(props);
    this.state = { currentScreen: "Splash" };
    this.screenManager = new ScreenManager();

    // Create screen instances
    this.splashScreen = new SplashScreen("Splash", require("../assets/images/gestureailogo.png"));
    this.signInScreen = new SignInScreenWrapper(this.navigate.bind(this));
    this.signUpScreen = new SignUpScreenWrapper(this.navigate.bind(this));
    this.appNavigatorScreen = new AppNavigatorWrapper(this.navigate.bind(this));

    // Register screens
    this.screenManager.addScreen(this.splashScreen);
    this.screenManager.addScreen(this.signInScreen);
    this.screenManager.addScreen(this.signUpScreen);
    this.screenManager.addScreen(this.appNavigatorScreen);
  }

  navigate(screenName: string) {
    this.setState({ currentScreen: screenName });
  }

  componentDidMount() {
    // After 2 seconds, switch from Splash to SignIn
    setTimeout(() => {
      this.setState({ currentScreen: "SignIn" });
    }, 2000);
  }

  render() {
    const activeScreen = this.screenManager.getScreenByName(this.state.currentScreen);
    return activeScreen ? activeScreen.render() : <View />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 200, height: 200, resizeMode: "contain" },
});