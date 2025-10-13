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
      
      if (data.status === 'success') {
        Alert.alert("Success", "Package processed successfully!");
      } else {
        const errorMessages = {
          customer_not_found: "Customer not found. Please verify the label.",
          customer_not_subscribed: "Customer does not have an active subscription.",
        };
        Alert.alert("Error", errorMessages[data.reason]);
      }
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
        {inferenceResult && !isProcessing && inferenceResult.status === 'success' && (
          <View style={styles.resultsContainer}>
            <ScrollView
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsContent}
            >
              {/* Success Header */}
              <View style={styles.successHeader}>
                <CheckCircle size={48} color="#16a34a" weight="fill" />
                <Text style={styles.successSubtitle}>
                  Customer charged successfully
                </Text>
              </View>

              {/* Results Cards */}
              <View style={styles.resultsGrid}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Customer</Text>
                  <Text style={styles.resultValue}>
                    {inferenceResult.data.recipientName}
                  </Text>
                </View>

                {inferenceResult.data.virtualAddress && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Virtual Address</Text>
                    <Text style={styles.resultValue}>
                      {inferenceResult.data.virtualAddress}
                    </Text>
                  </View>
                )}

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Order ID</Text>
                  <Text style={styles.resultValue}>
                    {inferenceResult.data.orderId}
                  </Text>
                </View>
              </View>

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
  successSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
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
