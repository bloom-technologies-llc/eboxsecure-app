import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { CameraScanner } from "@/components/CameraScanner";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/trpc/react";

import type { RouterOutputs } from "@ebox/admin-api";

type PackageXInferenceResponse = RouterOutputs["scanner"]["inferShippingLabel"];

export default function ScannerScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inferenceResult, setInferenceResult] =
    useState<PackageXInferenceResponse | null>(null);

  const inferMutation = api.scanner.inferShippingLabel.useMutation({
    onSuccess: (data) => {
      setInferenceResult(data);
      setIsProcessing(false);
      Alert.alert("Success", "Shipping label processed successfully!");
    },
    onError: (error) => {
      setIsProcessing(false);
      Alert.alert("Error", `Failed to process label: ${error.message}`);
    },
  });

  const handleImageCaptured = async (base64Image: string) => {
    setIsProcessing(true);
    setInferenceResult(null);

    try {
      await inferMutation.mutateAsync({
        imageUrl: base64Image,
      });
    } catch (error) {
      console.error("Inference error:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Barcode Scanner</ThemedText>

      {!isProcessing ? (
        <CameraScanner onImageCaptured={handleImageCaptured} />
      ) : (
        <ThemedView style={styles.processingContainer}>
          <ThemedText style={styles.processingText}>
            Processing shipping label...
          </ThemedText>
        </ThemedView>
      )}

      {inferenceResult && (
        <ScrollView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>
            Shipping Label Details:
          </ThemedText>

          {inferenceResult.data.tracking_number && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Tracking Number:</ThemedText>{" "}
              {inferenceResult.data.tracking_number}
            </ThemedText>
          )}

          {inferenceResult.data.carrier && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Carrier:</ThemedText>{" "}
              {inferenceResult.data.carrier}
            </ThemedText>
          )}

          {inferenceResult.data.service && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Service:</ThemedText>{" "}
              {inferenceResult.data.service}
            </ThemedText>
          )}

          {inferenceResult.data.weight && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Weight:</ThemedText>{" "}
              {inferenceResult.data.weight.value}{" "}
              {inferenceResult.data.weight.unit}
            </ThemedText>
          )}

          {inferenceResult.data.sender && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Sender:</ThemedText>{" "}
              {inferenceResult.data.sender.name ||
                inferenceResult.data.sender.company}
            </ThemedText>
          )}

          {inferenceResult.data.recipient && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Recipient:</ThemedText>{" "}
              {inferenceResult.data.recipient.name ||
                inferenceResult.data.recipient.company}
            </ThemedText>
          )}

          {inferenceResult.data.confidence_score && (
            <ThemedText style={styles.resultText}>
              <ThemedText style={styles.label}>Confidence:</ThemedText>{" "}
              {(inferenceResult.data.confidence_score * 100).toFixed(1)}%
            </ThemedText>
          )}

          {inferenceResult.data.exceptions &&
            inferenceResult.data.exceptions.length > 0 && (
              <ThemedText style={styles.resultText}>
                <ThemedText style={styles.label}>Exceptions:</ThemedText>{" "}
                {inferenceResult.data.exceptions.join(", ")}
              </ThemedText>
            )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    fontSize: 18,
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 20,
    maxHeight: 300,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  label: {
    fontWeight: "bold",
    color: "#2563eb",
  },
});
