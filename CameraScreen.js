import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';


const CameraScreen = () => {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off); // Flash mode state
  const cameraRef = useRef(null);

  useEffect(() => {
    handleCameraPermission();
  }, []);

  // Use useFocusEffect to handle camera activation when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      // Re-initialize the camera when the screen gains focus
      handleCameraPermission();
      return () => {
        // Cleanup function to stop the camera when the screen loses focus
        setIsPreviewActive(false);
        cameraRef.current?.pausePreview();
      };
    }, [])
  );

  const handleCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    if (status === 'granted') {
      setIsPreviewActive(true); // Activate the camera preview
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      // Optionally, you can save the captured image here
    }
  };

  const switchCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {cameraPermission && isPreviewActive ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            ratio="16:9"
            autoFocus="on"
            flashMode={flashMode} // Set flash mode
          />
        ) : (
          <Text style={styles.permissionText}>No access to camera</Text>
        )}
      </View>
      <View style={styles.cameraControls}>
        <TouchableOpacity style={[styles.captureButton, styles.buttonMagenta]} onPress={takePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rotateCameraButton, styles.buttonMagenta]} onPress={switchCameraType}>
          <Ionicons name="camera-reverse" size={24} color="#FF00FF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.flashButton, styles.buttonMagenta]} onPress={toggleFlashMode}>
          <Ionicons name={flashMode === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash'} size={24} color="#FF00FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  captureButton: {
    backgroundColor: '#FF00FF', // Magenta background color
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  
  rotateCameraButton: {
    borderRadius: 50, // Make it circular
    padding: 10,
    borderWidth: 2, // Add border width
    borderColor: '#FFFFFF', // Set border color
    marginLeft: 20,
  },
  
  flashButton: {
    borderRadius: 50, // Make it circular
    padding: 10,
    borderWidth: 2, // Add border width
    borderColor: '#FFFFFF', // Set border color
    marginRight: 20,
  },
  
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonMagenta: {
    backgroundColor: 'white', // Magenta color
  },
});

export default CameraScreen;