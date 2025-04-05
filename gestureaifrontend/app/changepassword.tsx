// ChangePassword.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const BASE_URL = "http://24.199.96.243:8000";

// Fetch user data using the provided userId
const getUserById = async (userId: string) => {
  const id = parseInt(userId, 10);
  const response = await fetch(`${BASE_URL}/appusers/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching user: ${response.statusText}`);
  }
  return response.json();
};

// Update user data via API (this endpoint must accept a "password" field)
const updateUser = async (userId: string, data: object) => {
  const response = await fetch(`${BASE_URL}/appusersupdate/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Error updating user: ${response.statusText}`);
  }
  return response.json();
};

// Verify credentials using the /login endpoint
const loginUser = async (identifier: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!response.ok) {
    throw new Error("Current password is incorrect.");
  }
  return response.json();
};

function ChangePassword() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      // First, retrieve the user data to get the identifier (e.g. email)
      const userData = await getUserById(userId);
      // Use the user's email (or username) as the identifier for login verification
      await loginUser(userData.email, currentPassword);

      // If login is successful, update the password.
      // (Assumes the update endpoint accepts a "password" field and handles hashing on the server.)
      await updateUser(userId, { password: newPassword });
      
      Alert.alert("Success", "Password updated successfully!");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error updating password:", error);
      Alert.alert("Error", error.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Change Password</Text>
      <TextInput
        secureTextEntry
        placeholder="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity onPress={handleUpdatePassword} style={styles.button}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "#3F6E57", padding: 15, borderRadius: 5, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#fff", fontSize: 16 },
  cancelButton: { alignItems: "center", marginTop: 10 },
  cancelButtonText: { color: "#3F6E57", textDecorationLine: "underline" },
});

export default ChangePassword;
