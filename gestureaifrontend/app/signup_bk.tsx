// Import React and the useState hook for managing component state.
import React, { useState } from "react";
// Import core React Native components for building the UI.
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

// Define the prop types for the SignUpScreen component.
// "navigate" is a function that takes a screen name ("SignIn" or "SignUp")
// and navigates to that screen.
type SignUpProps = {
  navigate: (screenName: "SignIn" | "SignUp") => void;
};

// Define the SignUpScreen functional component using React.FC with the specified props.
const SignUpScreen: React.FC<SignUpProps> = ({ navigate }) => {
  // State for username input; initially an empty string.
  const [username, setUsername] = useState("");
  // State for email input; initially an empty string.
  const [email, setEmail] = useState("");
  // State for phone number input; initially an empty string.
  const [phone, setPhone] = useState("");
  // State for password input; initially an empty string.
  const [password, setPassword] = useState("");
  // State for error messages; initially an empty string.
  const [error, setError] = useState<string>("");

  // Function to handle the sign-up process when the user taps the "Sign Up" button.
  const handleSignUp = async () => {
    try {
      // Send a POST request to the backend to create a new user.
      // The endpoint expects a JSON body containing username, email, password, and phone number.
      const response = await fetch("http://24.199.96.243:8000/appusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          phone_number: phone, // Note: the backend expects "phone_number" key.
        }),
      });

      // Check if the response indicates success (HTTP status 200-299).
      if (response.ok) {
        // Parse the response JSON containing the newly created user data.
        const data = await response.json();
        console.log("User created:", data);
        // Navigate back to the SignIn screen after successful registration.
        navigate("SignIn");
      } else {
        // If response is not ok, parse the error details.
        const errorData = await response.json();
        let errorMessage = "Sign up failed"; // Default error message.
        // If errorData contains a "detail" field, process it.
        if (errorData.detail) {
          // If the detail is a string, use it directly.
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } 
          // If the detail is an object, try to use its "msg" property or convert the whole object to a string.
          else if (typeof errorData.detail === "object") {
            errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
          }
        }
        // Update the error state to display the error message.
        setError(errorMessage);
      }
    } catch (e) {
      // In case of network or other errors, set a generic error message.
      setError("Error connecting to server");
    }
  };

  // Render the SignUp screen UI.
  return (
    // Main container View with styling applied.
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Sign Up</Text>
      {/* If there is an error, display it in red text; otherwise, render nothing */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* TextInput for the username */}
      <TextInput
        style={styles.input}
        placeholder="Username"          // Placeholder text shown when the field is empty.
        value={username}              // Controlled component; value tied to username state.
        onChangeText={setUsername}     // Update username state on text change.
      />
      {/* TextInput for the email */}
      <TextInput
        style={styles.input}
        placeholder="Email"             // Placeholder for email.
        value={email}                 // Controlled value for email state.
        onChangeText={setEmail}        // Update email state on change.
      />
      {/* TextInput for the phone number */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"      // Placeholder for phone number.
        value={phone}                 // Controlled value for phone state.
        onChangeText={setPhone}        // Update phone state on change.
      />
      {/* TextInput for the password; secureTextEntry masks the input */}
      <TextInput
        style={styles.input}
        placeholder="Password"          // Placeholder for password.
        value={password}              // Controlled value for password state.
        onChangeText={setPassword}     // Update password state on change.
        secureTextEntry               // Mask the password input for security.
      />
      {/* TouchableOpacity for the "Sign Up" button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        {/* Button text */}
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {/* TouchableOpacity for navigation link to the SignIn screen */}
      <TouchableOpacity onPress={() => navigate("SignIn")}>
        {/* Text link prompting users who already have an account to sign in */}
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

// Define the styles used in this component.
const styles = StyleSheet.create({
  // Container style: centers content and adds padding.
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  // Title text style: larger font size and margin at the bottom.
  title: { 
    fontSize: 24, 
    marginBottom: 20 
  },
  // Input style: full width, border, padding, margin, and rounded corners.
  input: {
    width: "100%",                // Take full width of container.
    borderWidth: 1,               // Thin border.
    borderColor: "#ccc",          // Light grey border.
    padding: 10,                  // Internal padding.
    marginBottom: 10,             // Spacing below each input.
    borderRadius: 5,              // Rounded corners.
  },
  // Button style: background color, padding, rounded corners, full width, and centered content.
  button: {
    backgroundColor: "#3F6E57",   // Dark green background.
    padding: 15,                  // Padding inside the button.
    borderRadius: 5,              // Rounded corners.
    width: "100%",                // Button spans full container width.
    alignItems: "center",         // Center text horizontally.
    marginBottom: 10,             // Space below the button.
  },
  // Button text style: white color and moderate font size.
  buttonText: { 
    color: "#fff", 
    fontSize: 16 
  },
  // Link text style: uses the same dark green color as the button and a moderate font size.
  linkText: { 
    color: "#3F6E57", 
    fontSize: 16 
  },
  // Error text style: red color to indicate errors and spacing below.
  error: { 
    color: "red", 
    marginBottom: 10 
  },
});

// Export the SignUpScreen component as the default export.
export default SignUpScreen;