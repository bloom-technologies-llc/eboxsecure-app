import type { PhoneNumberResource } from "@clerk/types";
import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { useRouter } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { useUser } from "@clerk/clerk-expo";
import { Button, Form, Input, Label } from "tamagui";

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
          <Form onSubmit={() => verifyCode()}>
            <Label htmlFor="code">Enter code</Label>
            <Input
              id="code"
              placeholder="Verification code"
              onChangeText={(e) => setCode(e)}
              value={code}
              keyboardType="number-pad"
            />
            <Form.Trigger asChild>
              <Button chromeless>Verify</Button>
            </Form.Trigger>
          </Form>
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
        <Form onSubmit={async () => handleSubmit()}>
          <Label htmlFor="phoneNumber">Add new phone number</Label>
          <Input
            id="phoneNumber"
            placeholder="Phone Number"
            onChangeText={(e) => setPhone(e)}
            value={phone}
            keyboardType="number-pad"
          />
          <Form.Trigger asChild>
            <Button chromeless>Add phone</Button>
          </Form.Trigger>
        </Form>
      </View>
    </SafeAreaView>
  );
};

export default AddPhone;
