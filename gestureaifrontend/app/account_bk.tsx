import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

type AccountProps = {
  userId: string | null;
  onLogout: () => void;
};

const BASE_URL = "http://24.199.96.243:8000";

// API call to fetch user data by ID
const getUserById = async (userId: string) => {
  const id = parseInt(userId, 10);
  const response = await fetch(`${BASE_URL}/appusers/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching user: ${response.statusText}`);
  }
  return response.json();
};

// API call to update user data (profile picture)
// Updated URL to match your backend route.
const updateUser = async (userId: string, data: object) => {
  const response = await fetch(`${BASE_URL}/appusersupdate/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Error updating user: ${response.statusText}`);
  }
  return response.json();
};

// Helper function to get base64 from image uri using FileSystem
const getBase64FromUri = async (uri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
};

export default function Account({ userId, onLogout }: AccountProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      (async () => {
        try {
          const fetchedUser = await getUserById(userId);
          setUser(fetchedUser);
        } catch (error: any) {
          console.error("Error fetching user:", error);
          Alert.alert("Error", "Could not fetch user data.");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Function to pick image from gallery and update profile picture
  const pickImageFromGallery = async () => {
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
      console.log("Image data is", imageData);
      console.log("User Id is", userId);


      // If base64 is not available, try to read it using FileSystem.
      if (!imageData) {
        try {
          imageData = await getBase64FromUri(asset.uri);
          console.log("Image data is", imageData);

        } catch (err) {
          console.error("Error converting image to base64:", err);
        }
      }
      if (imageData && userId) {
        try {
          const updatedUser = await updateUser(userId, { profile_picture: imageData });
          setUser(updatedUser);
          Alert.alert("Success", "Profile picture updated!");
        } catch (err) {
          console.error("Error updating profile picture:", err);
          Alert.alert("Error", "Could not update profile picture.");
        }
      } else {
        Alert.alert("Error", "No image data found.");
      }
    }
  };

  // Function to take a photo with camera and update profile picture
  const takePhoto = async () => {
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
          Alert.alert("Image data is", imageData);
        } catch (err) {
          console.error("Error converting image to base64:", err);
        }
      }
      if (imageData && userId) {
        try {
          const updatedUser = await updateUser(userId, { profile_picture: imageData });
          setUser(updatedUser);
          Alert.alert("Success", "Profile picture updated!");
        } catch (err) {
          console.error("Error updating profile picture:", err);
          Alert.alert("Error", "Could not update profile picture.");
        }
      } else {
        Alert.alert("Error", "No image data found.");
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const defaultAvatar = require("../assets/images/react-logo.png");
  const profileSource =
    user && user.profile_picture
      ? { uri: `data:image/jpeg;base64,${user.profile_picture}` }
      : defaultAvatar;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={profileSource} style={styles.profileImage} />
        <Text style={styles.username}>{user?.username || "Loading..."}</Text>
      </View>

      {/* Buttons for updating profile picture */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editProfileButton} onPress={pickImageFromGallery}>
          <Text style={styles.editProfileButtonText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editProfileButton} onPress={takePhoto}>
          <Text style={styles.editProfileButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={onLogout}>
          <Text style={styles.bottomButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    marginBottom: 10,
    elevation: 2,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  username: { fontSize: 18, fontWeight: "bold" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  editProfileButton: {
    backgroundColor: "#3F6E57",
    padding: 10,
    borderRadius: 5,
  },
  editProfileButtonText: { color: "#fff", fontSize: 14 },
  bottomContainer: {
    marginTop: 20,
    padding: 20,
    alignItems: "center",
  },
  bottomButton: {
    backgroundColor: "#3F6E57",
    padding: 15,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    marginVertical: 5,
  },
  bottomButtonText: { color: "#fff", fontSize: 16 },
});
