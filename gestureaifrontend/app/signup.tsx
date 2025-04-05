import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";

type SignUpProps = {
  navigate: (screenName: "SignIn" | "SignUp") => void;
};

const SignUpScreen: React.FC<SignUpProps> = ({ navigate }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const handleSignUp = async () => {
    try {
      const response = await fetch("http://24.199.96.243:8000/appusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          phone_number: phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User created:", data);
        navigate("SignIn");
      } else {
        const errorData = await response.json();
        let errorMessage = "Sign up failed";
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string"
            ? errorData.detail
            : errorData.detail.msg || JSON.stringify(errorData.detail);
        }
        setError(errorMessage);
      }
    } catch (e) {
      setError("Error connecting to server");
    }
  };

  return (
    // Wrap the screen in a KeyboardAvoidingView and ScrollView to handle keyboard
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>

           {/* Logo */}
                  <Image source={require('../assets/images/gestureailogo-transparent.png')} style={styles.logo} />
                
          <Text style={styles.title}>Sign Up</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={"#888"}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={"#888"}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={"#888"}
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={"#888"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate("SignIn")}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    textAlign: "left",
    backgroundColor: '#f9f9f9',
  },
  logo: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  button: {
    backgroundColor: "#3F6E57",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  linkText: {
    color: "#3F6E57",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignUpScreen;
