import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

const ASSEMBLY_API_KEY = 'd3f7bc3d37234e61ad5345ac1eee4e64';
const HARDCODED_AUDIO_URL = 'https://kowkdr1ycumpkmzt.public.blob.vercel-storage.com/Sunny-yXevWfsebfgMs3ZvNxC5qMRVrKVLJ6.mp3'; // Replace with your own URL

export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handlePress = async () => {
    if (isRecording) {
      // "Stop Recording" pressed — trigger transcription
      setLoading(true);
      try {
        const transcriptRes = await axios.post(
          'https://api.assemblyai.com/v2/transcript',
          { audio_url: HARDCODED_AUDIO_URL },
          {
            headers: {
              authorization: ASSEMBLY_API_KEY,
              'content-type': 'application/json',
            },
          }
        );

        const transcriptId = transcriptRes.data.id;

        let completed = false;
        let finalTranscript = '';

        while (!completed) {
          const pollingRes = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            {
              headers: { authorization: ASSEMBLY_API_KEY },
            }
          );

          if (pollingRes.data.status === 'completed') {
            finalTranscript = pollingRes.data.text;
            completed = true;
          } else if (pollingRes.data.status === 'error') {
            throw new Error('Transcription failed');
          } else {
            await new Promise((res) => setTimeout(res, 2000));
          }
        }

        setTranscript(finalTranscript);
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
      setLoading(false);
    }

    setIsRecording((prev) => !prev);
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.cameraWrapper}>
          <CameraView style={styles.camera} facing={facing}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>

        <View style={styles.controls}>
          <Button
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
            onPress={handlePress}
            color="#1e90ff"
          />

          {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

          {!loading && transcript !== '' && !isRecording && (
            <TextInput
              style={styles.textBox}
              value={transcript}
              placeholder="Transcript will appear here"
              editable={false}
              multiline
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraWrapper: {
    flex: 90,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00000088',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  controls: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  textBox: {
    marginTop: 15,
    height: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    color: 'black',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
  },
});
