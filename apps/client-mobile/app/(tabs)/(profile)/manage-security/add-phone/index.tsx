import type { PhoneNumberResource } from "@clerk/types";
import { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { useRouter } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { useUser } from "@clerk/clerk-expo";

const AddPhone = () => {
  const { user } = useUser();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneObj, setPhoneObj] = useState<PhoneNumberResource>();
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  if (!user) return null;

  const handleSubmit = async () => {
    try {
      // Add unverified phone number
      const res = await user?.createPhoneNumber({ phoneNumber: phone });
      // Reload user to get updated User object
      await user.reload();

      const phoneNumber = user.phoneNumbers.find((a) => a.id === res.id);
      setPhoneObj(phoneNumber);

      // Send user an SMS verification code
      phoneNumber?.prepareVerification();
      setIsVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Toast.show("An error occurred while adding a phone number", {
        duration: 3000,
        position: Toast.positions.TOP,
        backgroundColor: "#fc6060",
        textColor: "#000",
      });
    }
  };

  const verifyCode = async () => {
    try {
      // Verify code
      const phoneVerifyAttempt = await phoneObj?.attemptVerification({ code });

      if (phoneVerifyAttempt?.verification.status === "verified") {
        Toast.show("Successfully added phone number!", {
          duration: 3000,
          position: Toast.positions.TOP,
          backgroundColor: "#e9f9ee",
          textColor: "#000",
        });
        router.replace("/(tabs)/(profile)/manage-security");
      } else {
        console.error(JSON.stringify(phoneVerifyAttempt, null, 2));
        Toast.show("An error occurred while verifying phone number", {
          duration: 3000,
          position: Toast.positions.TOP,
          backgroundColor: "#fc6060",
          textColor: "#000",
        });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Toast.show("An error occurred while verifying phone number", {
        duration: 3000,
        position: Toast.positions.TOP,
        backgroundColor: "#fc6060",
        textColor: "#000",
      });
    }
  };

  if (isVerifying) {
    return (
      <SafeAreaView>
        <BackBreadcrumb />
        <View className="p-4">
          <Text className="text-lg font-semibold">Verify phone number</Text>
          <View className="mt-4">
            <Text className="mb-2 text-base font-medium text-gray-700">
              Enter code
            </Text>
            <TextInput
              className="mb-4 rounded-md border border-gray-300 px-3 py-3 text-base text-gray-900"
              placeholder="Verification code"
              placeholderTextColor="#6b7280"
              onChangeText={(e) => setCode(e)}
              value={code}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              className="rounded-md bg-blue-600 px-4 py-2"
              onPress={() => verifyCode()}
            >
              <Text className="text-center font-medium text-white">Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView>
      <BackBreadcrumb />
      <View className="p-4">
        <Text className="text-lg font-semibold">
          Add phone number to account
        </Text>
        <View className="mt-4">
          <Text className="mb-2 text-base font-medium text-gray-700">
            Add new phone number
          </Text>
          <TextInput
            className="mb-4 rounded-md border border-gray-300 px-3 py-3 text-base text-gray-900"
            placeholder="Phone Number"
            placeholderTextColor="#6b7280"
            onChangeText={(e) => setPhone(e)}
            value={phone}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            className="rounded-md bg-blue-600 px-4 py-2"
            onPress={async () => handleSubmit()}
          >
            <Text className="text-center font-medium text-white">
              Add phone
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddPhone;
