// Account.tsx
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
  Modal,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

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

// Send feedback via API
const sendFeedback = async (userId: string, content: string) => {
  const id = parseInt(userId, 10);
  const payload = { user_id: id, content };
  const response = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Error sending feedback: ${response.statusText}`);
  }
  return response.json();
};

type AccountProps = {
  userId: string;
  onLogout: () => void;
};

function Account({ userId, onLogout }: AccountProps) {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");

  // Re-fetch user data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        setLoading(true);
        getUserById(userId)
          .then((fetchedUser) => setUser(fetchedUser))
          .catch((error) => {
            console.error("Error fetching user:", error);
            Alert.alert("Error", "Could not fetch user data.");
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }, [userId])
  );

  // Check for updated user data passed via navigation params
  useEffect(() => {
    if (route.params && route.params.updatedUser) {
      setUser(route.params.updatedUser);
    }
  }, [route.params]);

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

  const handleEditProfile = () => {
    if (!userId) {
      Alert.alert("Error", "No userId found.");
      return;
    }
    navigation.navigate("EditProfile", { userId });
  };

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  const handleGoShop = () => {
    navigation.navigate("Shop");
  };

  const handleContactUs = () => {
    Alert.alert("Contact Us", "Phone: +1 9408828728\nEmail: arunsoma1998@gmail.com");
  };

  const handleFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const handleSendFeedback = async () => {
    if (!userId) {
      Alert.alert("Error", "No userId found.");
      return;
    }
    if (!feedbackContent.trim()) {
      Alert.alert("Error", "Feedback content is empty.");
      return;
    }
    try {
      await sendFeedback(userId, feedbackContent);
      Alert.alert("Success", "Feedback sent successfully!");
      setFeedbackContent("");
      setFeedbackModalVisible(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      Alert.alert("Error", "Could not send feedback.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with profile image and Edit Profile link */}
      <View style={styles.header}>
        <Image source={profileSource} style={styles.profileImage} />
        <Text style={styles.username}>{user?.username || "Loading..."}</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Favourites Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAVOURITES</Text>
        <TouchableOpacity style={styles.itemRow} onPress={handleGoHome}>
          <Text style={styles.itemText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemRow} onPress={handleGoShop}>
          <Text style={styles.itemText}>Shop our merchandise</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => Alert.alert("Notifications", "Notification settings...")}
        >
          <Text style={styles.itemText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => Alert.alert("Subscribe", "Subscription details...")}
        >
          <Text style={styles.itemText}>Subscribe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => Alert.alert("Learn", "Learning resources...")}
        >
          <Text style={styles.itemText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemRow} onPress={handleContactUs}>
          <Text style={styles.itemText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => Alert.alert("Train the model", "Model training details...")}
        >
          <Text style={styles.itemText}>Train the model</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemRow} onPress={onLogout}>
          <Text style={[styles.itemText, { color: "#E63946" }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FEEDBACK</Text>
        <TouchableOpacity style={styles.itemRow} onPress={handleFeedback}>
          <Text style={styles.itemText}>Send Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your feedback..."
              multiline
              value={feedbackContent}
              onChangeText={setFeedbackContent}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={{ color: "#000" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#3F6E57" }]}
                onPress={handleSendFeedback}
              >
                <Text style={{ color: "#fff" }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#fff", alignItems: "center", paddingTop: 40, paddingBottom: 20, marginBottom: 10, elevation: 2 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 5, backgroundColor: "#eee" },
  username: { fontSize: 18, fontWeight: "bold" },
  editProfileText: { marginTop: 5, color: "#3F6E57", textDecorationLine: "underline" },
  section: { backgroundColor: "#fff", marginVertical: 5, padding: 15 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10, color: "#333" },
  itemRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemText: { fontSize: 16, color: "#555" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: { height: 100, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, textAlignVertical: "top", padding: 10, marginBottom: 10 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { padding: 12, borderRadius: 5, minWidth: 80, alignItems: "center" },
});

export default Account;
