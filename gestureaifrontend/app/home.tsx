import React from "react";
import { View, Text, StyleSheet } from "react-native";

type HomeProps = {
  userId?: string | null;
};

export default function Home({ userId }: HomeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      {userId && <Text style={styles.subText}>User ID: {userId}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24 },
  subText: { fontSize: 16, marginTop: 10 },
});