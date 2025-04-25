import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type LearnProps = {
  userId?: string | null;
};

const VIDEO_WIDTH = 360;
const VIDEO_HEIGHT = 400;

const videoMap: Record<string, any> = {
  hi: require("../assets/avatar/hi.mp4"),
  "how are you doing?": require("../assets/avatar/how-are-you-doing.mp4"),
  "my name is arun": require("../assets/avatar/my-name-is-arun.mp4"),
  "weather is good today": require("../assets/avatar/weather-is-good-today.mp4"),
};

export default function Learn({ userId }: LearnProps) {
  const [text, setText] = useState("hello");
  const [source, setSource] = useState<any>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Show "hi" video initially when component mounts
    const initialKey = "hi";
    setSource(videoMap[initialKey]);
    setTimeout(() => videoRef.current?.replayAsync(), 100);
  }, []);

  const handleSend = () => {
    const key = text.trim().toLowerCase();
    if (videoMap[key]) {
      setSource(videoMap[key]);
      Keyboard.dismiss();
      setTimeout(() => videoRef.current?.replayAsync(), 100);
    } else {
      alert(`Sorry, no video for: “${text}”`);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* video slot */}
        <View style={styles.videoContainer}>
          {source ? (
            <Video
              ref={videoRef}
              source={source}
              style={styles.video}
              shouldPlay
              isLooping={false}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* input pinned at bottom */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter a phrase to be translated"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={24} color="#3F6E57" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  videoContainer: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    alignSelf: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
    paddingTop: 40, // 👈 Increased padding for iOS spacing
  },
  video: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  },
  placeholder: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
