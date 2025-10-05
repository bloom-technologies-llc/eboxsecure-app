import { useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface CameraScannerProps {
  onImageCaptured: (base64Image: string) => void;
}

export function CameraScanner({ onImageCaptured }: CameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <ThemedView />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          We need your permission to show the camera
        </ThemedText>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (isCapturing || !cameraRef.current) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
        exif: false,
      });

      if (photo?.base64) {
        const base64Image = `data:image/jpeg;base64,${photo.base64}`;
        onImageCaptured(base64Image);
      } else {
        throw new Error("Failed to capture image");
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      Alert.alert("Error", "Failed to capture image");
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <ThemedText style={styles.buttonText}>Flip Camera</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.captureButton,
              isCapturing && styles.capturingButton,
            ]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <ThemedText style={styles.buttonText}>
              {isCapturing ? "Capturing..." : "Capture"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </CameraView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 8,
  },
  captureButton: {
    backgroundColor: "rgba(0, 255, 0, 0.5)",
  },
  capturingButton: {
    backgroundColor: "rgba(255, 255, 0, 0.5)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
});
