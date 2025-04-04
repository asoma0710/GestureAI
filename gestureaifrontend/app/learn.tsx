import React from "react";
import { View, Text, StyleSheet } from "react-native";

type LearnProps = {
  userId?: string | null;
};

//this is where user can learn words and sentences from the Ai model ---model is not production or testing ready in development mode

export default function Learn({ userId }: LearnProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Learn Screen</Text>
      {userId && <Text style={styles.subText}>User ID: {userId}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24 },
  subText: { fontSize: 16, marginTop: 10 },
});