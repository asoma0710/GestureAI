// Import React and hooks for managing state.
import React, { useState, useEffect, useRef } from "react";
// Import essential React Native components for building the UI.
import { View, Text, Image, TextInput, TouchableOpacity, Animated, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";

// Define the prop types for SignInScreen.
// "navigate" is a function that switches screens (either "SignIn" or "SignUp").
// "onLoginSuccess" is a callback function that takes a userId string when login is successful.
type SignInProps = {
  navigate: (screenName: "SignIn" | "SignUp") => void;
  onLoginSuccess: (userId: string) => void;
};

// Define the SignInScreen functional component with its props.
const SignInScreen: React.FC<SignInProps> = ({ navigate, onLoginSuccess }) => {
  // Local state for the user identifier (username, email, or phone).
  const [identifier, setIdentifier] = useState("");
  // Local state for the user password.
  const [password, setPassword] = useState("");
  // Local state for error messages; initialized as an empty string.
  const [error, setError] = useState<string>("");

  const translateY = useRef(new Animated.Value(0)).current; // Controls screen movement

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      Animated.timing(translateY, {
        toValue: -event.endCoordinates.height / 2, // Move screen up by half the keyboard height
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(translateY, {
        toValue: 0, // Reset screen position
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // Function to handle the sign-in process.
  const handleSignIn = async () => {
    try {
      // Send a POST request to the login endpoint with identifier and password in JSON format.
      const response = await fetch("http://24.199.96.243:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      // If the response is successful (HTTP status 200-299).
      if (response.ok) {
        // Parse the JSON response.
        const data = await response.json();
        console.log("Logged in:", data);
        // Call the onLoginSuccess callback with the returned userId.
        // Data may have userId or id as key, so we check both.
        onLoginSuccess(data.userid || data.id || data.userId);
        console.log("userid  in:", data.userid);

      } else {
        // If the response is not ok, parse the error response.
        const errorData = await response.json();
        // Initialize a default error message.
        let errorMessage = "Login failed";
        // If the error response contains a "detail" field.
        if (errorData.detail) {
          // If the detail is a string, use it.
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } 
          // Otherwise, if it's an object, attempt to use its "msg" field or convert it to a string.
          else if (typeof errorData.detail === "object") {
            errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
          }
        }
        // Update the error state with the constructed message.
        setError(errorMessage);
      }
    } catch (e) {
      // If there is any error during the fetch operation, set a generic error message.
      setError("Error connecting to server");
    }
  };

  // Render the SignIn screen UI.
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      
        {/* Logo */}
        <Image source={require('../assets/images/gestureailogo-transparent.png')} style={styles.logo} />
      
        {/* Sign In Text */}
        <Text style={styles.signInText}>Sign In</Text>

        {/* Input Container */}
        <View style={styles.inputContainer}>
        
          {/* If there's an error, display it; otherwise, render nothing */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* TextInput for the user identifier (username, email, or phone) */}
          <TextInput
            style={styles.input}
            placeholder="Username, Email, or Phone"
            value={identifier}
            onChangeText={setIdentifier}  // Update identifier state when text changes.
          />

          {/* TextInput for the password with secure text entry enabled */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}      // Update password state when text changes.
            secureTextEntry                 // Hide the text input for security.
          />
          {/* Touchable button to trigger the sign-in process */}
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          {/* Link to navigate to the SignUp screen if the user doesn't have an account */}
          <TouchableOpacity onPress={() => navigate("SignUp")}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </TouchableWithoutFeedback>
  );
};

// Define the styles for the component using StyleSheet.
const styles = StyleSheet.create({
  // Container style for the main view.
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  // Style for the title text.
  title: { fontSize: 24, marginBottom: 20 },
  // Style for TextInput components.
  input: {
    width: "100%",                 // Input field takes full width of the container.
    borderWidth: 1,                // Thin border.
    borderColor: "#ccc",           // Light grey border color.
    padding: 10,                   // Padding inside the input.
    marginBottom: 10,              // Space below each input.
    borderRadius: 5,               // Slightly rounded corners.
  },
  // Style for the sign-in button.
  button: {
    backgroundColor: "#3F6E57",    // Dark green background.
    padding: 15,                   // Padding inside the button.
    borderRadius: 5,               // Rounded corners.
    width: "100%",                 // Button takes full width of container.
    alignItems: "center",          // Center text horizontally.
    marginBottom: 10,              // Space below the button.
  },

  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  // Style for the button text.
  buttonText: { color: "#fff", fontSize: 16 },

  // Style for the "Sign In" text.
  signInText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3F6E57",
    marginBottom: 20,
  },
  // Style for the animated logo.
  logo: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  // Style for the sign-up link text.
  linkText: { color: "#3F6E57", fontSize: 16, textAlign: "center" },
  // Style for error messages.
  error: { color: "red", marginBottom: 10 },
});

// Export the component as the default export of this module.
export default SignInScreen;