import React from "react";
import { View, Text, StyleSheet } from "react-native";
//Basic page needs improvements it is just one of the identified pages
type ShopProps = {
  userId?: string | null;
};

export default function Shop({ userId }: ShopProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shop Screen</Text>
      {userId && <Text style={styles.subText}>User ID: {userId}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24 },
  subText: { fontSize: 16, marginTop: 10 },
});