import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const BASE_URL = "http://24.199.96.243:8000";

type EditProfileProps = {};

// Fetch user data from the API using userId
const getUserById = async (userId: string) => {
  const id = parseInt(userId, 10);
  const response = await fetch(`${BASE_URL}/appusers/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching user: ${response.statusText}`);
  }
  return response.json();
};

// Update user data via API
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

// Convert image URI to Base64
const getBase64FromUri = async (uri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};

function EditProfile({}: EditProfileProps) {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "No userId provided.");
      navigation.goBack();
      return;
    }
    (async () => {
      try {
        const fetchedUser = await getUserById(userId);
        setUser(fetchedUser);
        setUsername(fetchedUser.username || "");
        setEmail(fetchedUser.email || "");
        setPhoneNumber(fetchedUser.phone_number || "");
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Could not fetch user data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery permissions are needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      let imageData = asset.base64;
      if (!imageData) {
        try {
          imageData = await getBase64FromUri(asset.uri);
        } catch (err) {
          console.error("Error converting image to base64:", err);
        }
      }
      if (imageData) {
        setUser({ ...user, profile_picture: imageData });
      }
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permissions are needed.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      let imageData = asset.base64;
      if (!imageData) {
        try {
          imageData = await getBase64FromUri(asset.uri);
        } catch (err) {
          console.error("Error converting image to base64:", err);
        }
      }
      if (imageData) {
        setUser({ ...user, profile_picture: imageData });
      }
    }
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Placeholder for changing password.");
  };

  const handleSave = async () => {
    try {
      if (!userId) return;
      const payload = {
        username,
        email,
        phone_number: phoneNumber,
        profile_picture: user?.profile_picture || "",
      };
      const updated = await updateUser(userId, payload);
      setUser(updated);
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Error updating user:", err);
      Alert.alert("Error", "Could not update user profile.");
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Cancel button and title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 60 }} /> {/* Placeholder for alignment */}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* Buttons to update profile picture */}
      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
          <Text style={styles.photoButtonText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password */}
      <TouchableOpacity style={styles.linkButton} onPress={handleChangePassword}>
        <Text style={styles.linkButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 10,
  },
  cancelText: {
    fontSize: 16,
    color: "#E63946",
    width: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  photoContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 15,
  },
  photoButton: {
    backgroundColor: "#3F6E57",
    padding: 10,
    borderRadius: 5,
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  linkButton: {
    alignItems: "center",
    marginVertical: 5,
  },
  linkButtonText: {
    color: "#3F6E57",
    textDecorationLine: "underline",
  },
  saveButton: {
    backgroundColor: "#3F6E57",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default EditProfile;