import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "@/trpc/react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import QRCode from "react-qr-code";

type QRModalProps = {
  orderId: number;
};

const QRModal = ({ orderId }: QRModalProps) => {
  const {
    data: qrCode,
    isLoading,
    error,
  } = api.auth.getAuthorizedPickupToken.useQuery(
    { orderId },
    {
      enabled: Boolean(orderId),
      refetchInterval: 1000 * 60 * 15, // refresh every 15 minutes
    },
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["25%", "55%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  return (
    <View
      style={{ alignSelf: "flex-start" }}
      className="rounded-md border border-[#333333] p-2"
    >
      <Pressable onPress={handlePresentModalPress}>
        <Text>View QR code</Text>
      </Pressable>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        style={styles.container}
      >
        <BottomSheetView
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}
        >
          <View className="items-center gap-y-5">
            {isLoading && <ActivityIndicator size="large" color="#333" />}
            {error && (
              <Text className="text-center text-red-600">
                Error loading QR code. Please try again.
              </Text>
            )}
            {!isLoading && !error && qrCode ? (
              <>
                <QRCode value={qrCode} size={280} />
                <Text className="text-center text-xl">Scan QR code</Text>
                <Text className="text-center text-[#575959]">
                  Once you arrive at your EBOX location, show the agent your
                  code to pickup your package
                </Text>
              </>
            ) : null}
            {!isLoading && !error && !qrCode && (
              <Text className="text-center text-[#575959]">
                QR code not available at this time.
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleCloseModal}
            className="mt-8 rounded-md bg-[#333] p-3"
          >
            <Text className="text-center text-white">Close</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#333",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.64,
    shadowRadius: 11.14,
    elevation: 17,
  },
});

export default QRModal;
