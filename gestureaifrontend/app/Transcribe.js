import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const ASSEMBLY_API_KEY = 'd3f7bc3d37234e61ad5345ac1eee4e64';
const FILE_URL = 'https://kowkdr1ycumpkmzt.public.blob.vercel-storage.com/hello-M3lzMgwAuVWLU3k4Hbn8EcHUS7zb6M.mp3'; // Publicly accessible MP3

export default function TranscribeUrlAudio() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transcribeAudio = async () => {
      try {
        // 1. Send transcription request
        const transcriptRes = await axios.post(
          'https://api.assemblyai.com/v2/transcript',
          { audio_url: FILE_URL },
          {
            headers: {
              authorization: ASSEMBLY_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        const transcriptId = transcriptRes.data.id;

        // 2. Poll until transcription completes
        let completed = false;
        while (!completed) {
          const pollingRes = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
            {
              headers: { authorization: ASSEMBLY_API_KEY },
            }
          );

          if (pollingRes.data.status === 'completed') {
            setTranscript(pollingRes.data.text);
            completed = true;
          } else if (pollingRes.data.status === 'error') {
            setTranscript('Transcription failed');
            completed = true;
          } else {
            await new Promise((res) => setTimeout(res, 2000));
          }
        }
      } catch (err) {
        console.error('Transcription error:', err);
        setTranscript('Something went wrong!');
      } finally {
        setLoading(false);
      }
    };

    transcribeAudio();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.transcript}>{transcript}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  transcript: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
