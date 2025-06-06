import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

const QRModal = () => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "55%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // renders
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
        <BottomSheetView>
          <View
            style={{ justifyContent: "center" }}
            className="mx-6 flex h-full justify-center gap-y-9"
          >
            <View className="flex gap-y-5">
              <View className="mx-auto h-60 w-8/12">
                <Image
                  style={{ width: "100%", flex: 1 }}
                  // couldnt get image to load in so...
                  source="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/440px-QR_code_for_mobile_English_Wikipedia.svg.png"
                  contentFit="cover"
                />
              </View>
              <Text className="text-center text-xl">Scan QR code</Text>
              <Text className="text-center text-[#575959]">
                Once you arrive at your EBOX location, show the agent your code
                to pickup your package
              </Text>
            </View>
            <Pressable
              onPress={handleCloseModal}
              className="rounded-md bg-[#333] p-3"
            >
              <Text className="text-center text-white">Close</Text>
            </Pressable>
          </View>
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
