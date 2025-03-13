import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from 'axios';

const SignUp = () => {

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (first_name === '' || last_name === '' || username === '' || email === '' || password === '') {
      Alert.alert("All fields are required");
      return;
    }
    
    const formData = {
      first_name,
      last_name,
      username,
      email,
      password,
    };

    try {
      const response = await axios.post("http://24.199.96.243:8000/register", formData);

      if (response.status === 200) {
        // Handle success - maybe navigate to the home screen or show a success message
        Alert.alert('Success', 'Sign up Successful!');
      } else {
        // Handle errors - maybe show an error message
        Alert.alert('Error in SignUp', 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error in SignUp:', error);
      Alert.alert('Error in SignUp', 'An error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require("../assets/Creepy_Candy.jpg")} style={styles.imageStyles} />
      </View>
      <View style={{ marginHorizontal: 24 }}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.signupInput}
          value={first_name}
          onChangeText={text => setFirstName(text)}
          autoCapitalize='words'
          autoCorrect={false}
        />
      </View>
      <View style={{ marginHorizontal: 24 }}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.signupInput}
          value={last_name}
          onChangeText={text => setLastName(text)}
          autoCapitalize='words'
          autoCorrect={false}
        />
      </View>
      <View style={{ marginHorizontal: 24 }}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.signupInput}
          value={username}
          onChangeText={text => setUsername(text)}
          autoCapitalize='none'
          autoCorrect={false}
        />
      </View>
      <View style={{ marginHorizontal: 24 }}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.signupInput}
          value={email}
          onChangeText={text => setEmail(text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.signupInput, { marginBottom: 20 }]} // Added marginBottom to the password input
          value={password}
          onChangeText={text => setPassword(text)}
          secureTextEntry={true}
          autoCompleteType='password'
        />
      </View>
      <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 24,
  },
  label: {
    fontSize: 16,
    color: '#8e93a1',
    marginBottom: 10,
  },
  signupInput: {
    borderBottomWidth: 0.5,
    height: 48,
    borderBottomColor: "#8e93a1",
  },
  buttonStyle: {
    backgroundColor: "4CA47B",
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    marginHorizontal: 15,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    marginBottom: 50,
  },
  imageStyles: {
    width: 100,
    height: 100,
  }
});

export default SignUp;