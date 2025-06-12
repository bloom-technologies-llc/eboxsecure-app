import type { PhoneNumberResource } from "@clerk/types";
import {
  Alert,
  SafeAreaView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { e164ToHumanReadable } from "@/utils/formatter";
import { useUser } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";
import { Phone, Trash } from "phosphor-react-native";

const ManageSecurity = () => {
  const { userOwnsCredentials, clearCredentials, biometricType } =
    useLocalCredentials();

  const handleDisableBiometric = () => {
    Alert.alert(
      "Disable Biometric Authentication",
      "Are you sure you want to disable biometric authentication? You will need to sign in with your username and password again to re-enable it.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => clearCredentials(),
        },
      ],
    );
  };

  return (
    <SafeAreaView>
      <BackBreadcrumb />
      <ManageMfaPhoneNumbers />
      <ManageAvailablePhoneNumbers />
      <View className="flex flex-row justify-center">
        <Link href="/(tabs)/(profile)/manage-security/add-phone">
          Add Phone
        </Link>
      </View>
      <View className="mx-4 my-4 h-px bg-gray-300" />
      <View className="flex flex-col gap-4 p-4">
        <Text className="text-lg font-semibold">Biometric Authentication</Text>

        {userOwnsCredentials ? (
          <View className="flex flex-col gap-3">
            <View className="flex flex-row items-center gap-2">
              <Text className="text-sm font-medium text-green-600">
                ✓ Enabled
              </Text>
              <Text className="text-sm text-gray-500">
                {biometricType === "face-recognition" ? "Face ID" : "Touch ID"}{" "}
                is set up
              </Text>
            </View>

            <Text className="text-sm text-gray-600">
              You can use biometric authentication to sign in quickly.
            </Text>

            <TouchableOpacity
              onPress={handleDisableBiometric}
              className="mt-2 self-start rounded-md border border-red-300 px-4 py-2"
            >
              <Text className="text-sm font-medium text-red-600">
                Disable Biometric Authentication
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            <Text className="text-sm text-gray-500">
              Biometric authentication is not set up. Sign out and sign in again
              with your username and password to enable biometric
              authentication.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageSecurity;

// Display phone numbers reserved for MFA
const ManageMfaPhoneNumbers = () => {
  const { user } = useUser();

  if (!user) return null;

  // Check if any phone numbers are reserved for MFA
  const mfaPhones = user.phoneNumbers
    .filter((ph) => ph.verification.status === "verified")
    .filter((ph) => ph.reservedForSecondFactor)
    .sort((ph: PhoneNumberResource) => (ph.defaultSecondFactor ? -1 : 1));

  if (mfaPhones.length === 0) {
    return null;
  }

  const handleDestroy = async (phone: PhoneNumberResource) => {
    try {
      await phone.destroy();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <View className="p-4">
      <Text className="text-lg font-semibold">
        Phone numbers reserved for MFA
      </Text>
      <View className="flex flex-col gap-4 py-4">
        {mfaPhones.map((phone) => {
          return (
            <View
              key={`${phone.id}-mfa`}
              className="flex flex-row items-center justify-between rounded-lg border border-gray-300 px-2 py-4"
            >
              <View className="flex flex-row gap-1">
                <Phone size="18" />
                <Text
                  className={`text-sm ${
                    phone.defaultSecondFactor && "text-green-600"
                  }`}
                >
                  {e164ToHumanReadable(phone.phoneNumber)}{" "}
                </Text>
              </View>
              <View className="flex flex-row gap-1">
                {!phone.defaultSecondFactor && (
                  <TouchableOpacity
                    className="px-3 py-1"
                    onPress={() => phone.makeDefaultSecondFactor()}
                  >
                    <Text className="text-blue-600">Make default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() =>
                    phone.setReservedForSecondFactor({ reserved: false })
                  }
                >
                  <Text className="text-red-500">Disable</Text>
                </TouchableOpacity>

                {user.phoneNumbers.length > 1 && (
                  <TouchableOpacity
                    className="px-3 py-1"
                    onPress={async () => handleDestroy(phone)}
                  >
                    <Trash size="18" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Display phone numbers that are not reserved for MFA
const ManageAvailablePhoneNumbers = () => {
  const { user } = useUser();

  if (!user) return null;

  // Check if any phone numbers aren't reserved for MFA
  const availalableForMfaPhones = user.phoneNumbers
    .filter((ph) => ph.verification.status === "verified")
    .filter((ph) => !ph.reservedForSecondFactor);

  // Reserve a phone number for MFA
  const reservePhoneForMfa = async (phone: PhoneNumberResource) => {
    // Set the phone number as reserved for MFA
    await phone.setReservedForSecondFactor({ reserved: true });
    // Refresh the user information to reflect changes
    await user.reload();
  };

  const handleDestroy = async (phone: PhoneNumberResource) => {
    try {
      await phone.destroy();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (availalableForMfaPhones.length === 0) {
    return null;
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-semibold">
        Available phone numbers for MFA
      </Text>

      <View className="flex flex-col gap-4 py-4">
        {availalableForMfaPhones.map((phone) => {
          return (
            <View
              key={phone.id}
              className="flex flex-row items-center justify-between rounded-lg border border-gray-300 px-2 py-4"
            >
              <View className="flex flex-row gap-1">
                <Phone size="18" />
                <Text className="text-sm">
                  {e164ToHumanReadable(phone.phoneNumber)}{" "}
                </Text>
              </View>
              <View className="flex flex-row gap-1">
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() => reservePhoneForMfa(phone)}
                >
                  <Text className="text-blue-600">Use for MFA</Text>
                </TouchableOpacity>

                {user.phoneNumbers.length > 1 && (
                  <TouchableOpacity
                    className="px-3 py-1"
                    onPress={async () => handleDestroy(phone)}
                  >
                    <Trash size="18" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
