import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { CameraScanner } from "@/components/CameraScanner";
import { api } from "@/trpc/react";
import { CheckCircle, Package, X } from "phosphor-react-native";

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

  const handleClose = () => {
    if (isProcessing) {
      Alert.alert(
        "Processing",
        "Please wait for the current scan to complete.",
      );
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Package size={28} color="#1e40af" weight="bold" />
              <Text style={styles.headerTitle}>Label Scanner</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={28} color="#64748b" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera or Processing View */}
        {!isProcessing && !inferenceResult ? (
          <View style={styles.cameraContainer}>
            <CameraScanner onImageCaptured={handleImageCaptured} />
          </View>
        ) : isProcessing ? (
          <View style={styles.processingContainer}>
            <View style={styles.processingContent}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.processingText}>
                Processing shipping label...
              </Text>
              <Text style={styles.processingSubtext}>
                This may take a few seconds
              </Text>
            </View>
          </View>
        ) : null}

        {/* Results Section */}
        {inferenceResult && !isProcessing && (
          <View style={styles.resultsContainer}>
            <ScrollView
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsContent}
            >
              {/* Success Header */}
              <View style={styles.successHeader}>
                <CheckCircle size={48} color="#16a34a" weight="fill" />
                <Text style={styles.successTitle}>Scan Complete</Text>
              </View>

              {/* Results Cards */}
              <View style={styles.resultsGrid}>
                {inferenceResult.data.tracking_number && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Tracking Number</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.tracking_number}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.carrier && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Carrier</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.carrier}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.service && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Service</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.service}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.weight && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Weight</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.weight.value}{" "}
                      {inferenceResult.data.weight.unit}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.sender && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Sender</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.sender.name ||
                        inferenceResult.data.sender.company ||
                        "N/A"}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.recipient && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Recipient</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.recipient.name ||
                        inferenceResult.data.recipient.company ||
                        "N/A"}
                    </Text>
                  </View>
                )}

                {inferenceResult.data.confidence_score && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Confidence</Text>
                    <Text style={styles.resultValue}>
                      {(inferenceResult.data.confidence_score * 100).toFixed(1)}
                      %
                    </Text>
                  </View>
                )}
              </View>

              {/* Exceptions */}
              {inferenceResult.data.exceptions &&
                inferenceResult.data.exceptions.length > 0 && (
                  <View style={styles.exceptionsCard}>
                    <Text style={styles.exceptionsLabel}>Exceptions</Text>
                    <Text style={styles.exceptionsText}>
                      {inferenceResult.data.exceptions.join(", ")}
                    </Text>
                  </View>
                )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={() => {
                    setInferenceResult(null);
                    setIsProcessing(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scanAgainButtonText}>Scan Another</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  processingContent: {
    alignItems: "center",
    padding: 32,
  },
  processingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    textAlign: "center",
  },
  processingSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 12,
  },
  resultsGrid: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  exceptionsCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  exceptionsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991b1b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  exceptionsText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  scanAgainButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  scanAgainButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  doneButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
