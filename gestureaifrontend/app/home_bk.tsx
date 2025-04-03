import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  camera: {
    flex: 7, // 70% of the screen
  },
  textBox: {
    flex: 3, // 30% of the screen
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <Text>Camera</Text>
      </View>
      <View style={styles.textBox}>
        <Text>Text Box</Text>
      </View>
    </View>
  );
};