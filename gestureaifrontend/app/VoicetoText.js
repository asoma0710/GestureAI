import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const ASSEMBLY_API_KEY = 'd3f7bc3d37234e61ad5345ac1eee4e64';

export default function SpeechToText() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setLoading(true);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    try {
      // Step 1: Read the file
      const fileData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

      // Step 2: Upload to AssemblyAI
      const uploadRes = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        fileData,
        {
          headers: {
            authorization: ASSEMBLY_API_KEY,
            'content-type': 'application/octet-stream'
          }
        }
      );

      const audioUrl = uploadRes.data.upload_url;

      // Step 3: Request transcription
      const transcriptRes = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl },
        {
          headers: {
            authorization: ASSEMBLY_API_KEY,
            'content-type': 'application/json'
          }
        }
      );

      const transcriptId = transcriptRes.data.id;

      // Step 4: Poll for completion
      let completed = false;
      let finalTranscript = '';

      while (!completed) {
        const pollingRes = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: ASSEMBLY_API_KEY }
        });

        if (pollingRes.data.status === 'completed') {
          finalTranscript = pollingRes.data.text;
          completed = true;
        } else if (pollingRes.data.status === 'error') {
          throw new Error('Transcription failed');
        } else {
          await new Promise(res => setTimeout(res, 2000)); // wait before polling again
        }
      }

      setTranscript(finalTranscript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }

    setLoading(false);
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {transcript ? <Text style={{ marginTop: 20 }}>{transcript}</Text> : null}
    </View>
  );
}
