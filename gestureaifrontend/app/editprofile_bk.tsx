import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

type EditProfileProps = {
  userId: string | null;
};

const EditProfile: React.FC<EditProfileProps> = ({ userId }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (userId) {
      // For demonstration purposes, we simulate fetching existing profile data.
      // In a real application, you might call an API endpoint to load user details.
      setUsername("JohnDoe");
      setEmail("johndoe@example.com");
      setProfilePicture("");
    }
  }, [userId]);

  const updateProfile = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/appusersupdate/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          profile_picture: profilePicture, // Expecting a base64 string if applicable.
        }),
      });
      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while updating profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Picture (Base64)"
        value={profilePicture}
        onChangeText={setProfilePicture}
      />
      <Button title="Update Profile" onPress={updateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
  },
});

export default EditProfile;