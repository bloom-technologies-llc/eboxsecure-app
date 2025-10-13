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
    <SafeAreaView style={styles.container}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingTitle}>Reading shipping label...</Text>
          <Text style={styles.loadingSubtitle}>
            This may take a few seconds
          </Text>
        </View>
      )}

      {/* Form View */}
      {inferenceData && !processResult && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContainer}
        >
          <Text style={styles.formTitle}>Review Package Details</Text>
          <Text style={styles.formSubtitle}>
            Verify and edit the information below before processing
          </Text>

          <View style={styles.formFields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Recipient Name *</Text>
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Enter recipient name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Formatted Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formattedAddress}
                onChangeText={setFormattedAddress}
                placeholder="Enter formatted address"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Virtual Address</Text>
              <TextInput
                style={styles.input}
                value={virtualAddress}
                onChangeText={setVirtualAddress}
                placeholder="e.g., Suite 123, Box A"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tracking Number</Text>
              <TextInput
                style={styles.input}
                value={trackingNumber}
                onChangeText={setTrackingNumber}
                placeholder="Enter tracking number"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Vendor Order ID</Text>
              <TextInput
                style={styles.input}
                value={vendorOrderId}
                onChangeText={setVendorOrderId}
                placeholder="Enter vendor order ID"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.jsonToggle}
            onPress={() => setShowRawJson(!showRawJson)}
            activeOpacity={0.7}
          >
            <Text style={styles.jsonToggleText}>
              {showRawJson ? "Hide" : "View"} Raw JSON
            </Text>
          </TouchableOpacity>

          {showRawJson && rawDeliveryJson && (
            <View style={styles.jsonContainer}>
              <ScrollView style={styles.jsonScroll} nestedScrollEnabled>
                <Text style={styles.jsonText}>
                  {JSON.stringify(JSON.parse(rawDeliveryJson), null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={handleProcess}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Process Package</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Success View */}
      {processResult && processResult.status === "success" && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.successContainer}
        >
          <View style={styles.successHeader}>
            <CheckCircle size={48} color="#16a34a" weight="fill" />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successSubtitle}>
              Customer charged successfully
            </Text>
          </View>

          <View style={styles.resultCards}>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Customer</Text>
              <Text style={styles.resultCardValue}>
                {processResult.data.recipientName}
              </Text>
            </View>

            {processResult.data.virtualAddress && (
              <View style={styles.resultCard}>
                <Text style={styles.resultCardLabel}>Virtual Address</Text>
                <Text style={styles.resultCardValue}>
                  {processResult.data.virtualAddress}
                </Text>
              </View>
            )}

            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Order ID</Text>
              <Text style={styles.resultCardValue}>
                {processResult.data.orderId}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Scan Another</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "white",
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
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    minHeight: 80,
  },
  jsonToggle: {
    marginTop: 20,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    height: 192,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
  },
  jsonScroll: {
    flex: 1,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#e2e8f0",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
  },
  disabledButton: {
    opacity: 0.6,
  },
  successContainer: {
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  resultCards: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultCardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
});
