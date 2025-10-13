import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { CameraScanner } from "@/components/CameraScanner";
import { api } from "@/trpc/react";
import { CheckCircle, Package, X } from "phosphor-react-native";

import type { RouterOutputs } from "@ebox/admin-api";

type InferenceData = RouterOutputs["scanner"]["inferShippingLabel"];
type ProcessResult = RouterOutputs["scanner"]["processPackage"];

export default function ScannerScreen() {
  const [isInferring, setIsInferring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inferenceData, setInferenceData] = useState<InferenceData | null>(
    null,
  );
  const [processResult, setProcessResult] = useState<ProcessResult | null>(
    null,
  );
  const [showRawJson, setShowRawJson] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [virtualAddress, setVirtualAddress] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [vendorOrderId, setVendorOrderId] = useState("");
  const [rawDeliveryJson, setRawDeliveryJson] = useState("");

  const inferMutation = api.scanner.inferShippingLabel.useMutation({
    onSuccess: (data) => {
      setInferenceData(data);
      // Populate form fields
      setRecipientName(data.recipientName);
      setFormattedAddress(data.formattedAddress);
      setVirtualAddress(data.virtualAddress || "");
      setTrackingNumber(data.trackingNumber || "");
      setVendorOrderId(data.vendorOrderId || "");
      setRawDeliveryJson(data.rawDeliveryJson);
      setIsInferring(false);
    },
    onError: (error) => {
      setIsInferring(false);
      Alert.alert("Inference Error", `Failed to read label: ${error.message}`);
    },
  });

  const processMutation = api.scanner.processPackage.useMutation({
    onSuccess: (data) => {
      setProcessResult(data);
      setIsProcessing(false);

      if (data.status === "success") {
        Alert.alert("Success", "Package processed successfully!");
      } else {
        const errorMessages = {
          customer_not_found: "Customer not found. Please verify the label.",
          customer_not_subscribed:
            "Customer does not have an active subscription.",
          missing_identifier:
            "Order has neither a tracking number nor virtual address. Unable to uniquely identify the customer.",
        };
        Alert.alert("Error", errorMessages[data.reason]);
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      Alert.alert(
        "Processing Error",
        `Failed to process package: ${error.message}`,
      );
    },
  });

  const handleImageCaptured = async (base64Image: string) => {
    setIsInferring(true);
    setInferenceData(null);
    setProcessResult(null);

    try {
      await inferMutation.mutateAsync({
        imageUrl: base64Image,
      });
    } catch (error) {
      console.error("Inference error:", error);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);

    try {
      await processMutation.mutateAsync({
        recipientName,
        formattedAddress,
        rawDeliveryJson,
        virtualAddress: virtualAddress || undefined,
        trackingNumber: trackingNumber || undefined,
        vendorOrderId: vendorOrderId || undefined,
      });
    } catch (error) {
      console.error("Processing error:", error);
    }
  };

  const handleReset = () => {
    setInferenceData(null);
    setProcessResult(null);
    setShowRawJson(false);
    setRecipientName("");
    setFormattedAddress("");
    setVirtualAddress("");
    setTrackingNumber("");
    setVendorOrderId("");
    setRawDeliveryJson("");
  };

  const handleClose = () => {
    if (isInferring || isProcessing) {
      Alert.alert(
        "Processing",
        "Please wait for the current operation to complete.",
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

        {/* Camera View */}
        {!isInferring && !inferenceData && !processResult && (
          <View style={styles.cameraContainer}>
            <CameraScanner onImageCaptured={handleImageCaptured} />
          </View>
        )}

        {/* Inferring View */}
        {isInferring && (
          <View style={styles.processingContainer}>
            <View style={styles.processingContent}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.processingText}>
                Reading shipping label...
              </Text>
              <Text style={styles.processingSubtext}>
                This may take a few seconds
              </Text>
            </View>
          </View>
        )}

        {/* Form View - After Inference */}
        {inferenceData && !processResult && (
          <View style={styles.formContainer}>
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
            >
              <Text style={styles.formTitle}>Review Package Details</Text>
              <Text style={styles.formSubtitle}>
                Verify and edit the information below before processing
              </Text>

              {/* Form Fields */}
              <View style={styles.formFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Recipient Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={recipientName}
                    onChangeText={setRecipientName}
                    placeholder="Enter recipient name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Formatted Address *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    value={formattedAddress}
                    onChangeText={setFormattedAddress}
                    placeholder="Enter formatted address"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Virtual Address</Text>
                  <TextInput
                    style={styles.textInput}
                    value={virtualAddress}
                    onChangeText={setVirtualAddress}
                    placeholder="e.g., Suite 123, Box A"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tracking Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    placeholder="Enter tracking number"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vendor Order ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={vendorOrderId}
                    onChangeText={setVendorOrderId}
                    placeholder="Enter vendor order ID"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Raw JSON Toggle */}
              <TouchableOpacity
                style={styles.jsonToggle}
                onPress={() => setShowRawJson(!showRawJson)}
                activeOpacity={0.7}
              >
                <Text style={styles.jsonToggleText}>
                  {showRawJson ? "Hide" : "View"} Raw JSON
                </Text>
              </TouchableOpacity>

              {showRawJson && (
                <View style={styles.jsonContainer}>
                  <ScrollView style={styles.jsonScroll} horizontal>
                    <Text style={styles.jsonText}>{rawDeliveryJson}</Text>
                  </ScrollView>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.processButton,
                    isProcessing && styles.processButtonDisabled,
                  ]}
                  onPress={handleProcess}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.processButtonText}>
                      Process Package
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Success Results Section */}
        {processResult && processResult.status === "success" && (
          <View style={styles.resultsContainer}>
            <ScrollView
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsContent}
            >
              {/* Success Header */}
              <View style={styles.successHeader}>
                <CheckCircle size={48} color="#16a34a" weight="fill" />
                <Text style={styles.successTitle}>Success!</Text>
                <Text style={styles.successSubtitle}>
                  Customer charged successfully
                </Text>
              </View>

              {/* Results Cards */}
              <View style={styles.resultsGrid}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Customer</Text>
                  <Text style={styles.resultValue}>
                    {processResult.data.recipientName}
                  </Text>
                </View>

                {processResult.data.virtualAddress && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Virtual Address</Text>
                    <Text style={styles.resultValue}>
                      {processResult.data.virtualAddress}
                    </Text>
                  </View>
                )}

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Order ID</Text>
                  <Text style={styles.resultValue}>
                    {processResult.data.orderId}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={handleReset}
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
  // Form Styles
  formContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  formFields: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  jsonToggle: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
  },
  jsonToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  jsonContainer: {
    marginTop: 12,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  jsonScroll: {
    flex: 1,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#e2e8f0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
  },
  processButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  processButtonDisabled: {
    opacity: 0.6,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  // Results Styles
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
