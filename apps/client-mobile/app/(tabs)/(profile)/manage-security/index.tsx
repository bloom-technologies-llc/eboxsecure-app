import type { PhoneNumberResource } from "@clerk/types";
import { SafeAreaView, Text, View } from "react-native";
import { Link } from "expo-router";
import BackBreadcrumb from "@/components/ui/BackBreadcrumb";
import { e164ToHumanReadable } from "@/utils/formatter";
import { useUser } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";
import { Phone, Trash } from "phosphor-react-native";
import { Button, Separator, Switch } from "tamagui";

const ManageSecurity = () => {
  const { userOwnsCredentials, clearCredentials } = useLocalCredentials();
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
      <Separator marginVertical={16} borderWidth={1} borderColor="#E5E5E5" />
      <View className="flex flex-col gap-4 p-4">
        <Text className="text-lg font-semibold">Biometric Authentication</Text>
        <View className="flex flex-row items-center gap-2">
          <Switch
            disabled={!userOwnsCredentials}
            checked={userOwnsCredentials ?? false}
            onCheckedChange={(isEnabled) => {
              if (!isEnabled) {
                clearCredentials();
              }
            }}
          >
            <Switch.Thumb animation="quick" />
          </Switch>
          <Text className="text-gray-500">
            {!userOwnsCredentials
              ? "Sign out and sign in again to enable biometric authentication"
              : "Currently using biometric authentication"}
          </Text>
        </View>
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
                  <Button
                    size="$2"
                    chromeless
                    onPress={() => phone.makeDefaultSecondFactor()}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  size="$2"
                  chromeless
                  onPress={() =>
                    phone.setReservedForSecondFactor({ reserved: false })
                  }
                >
                  <Text className="text-red-500">Disable</Text>
                </Button>

                {user.phoneNumbers.length > 1 && (
                  <Button
                    chromeless
                    size="$2"
                    onPress={async () => handleDestroy(phone)}
                  >
                    <Trash size="18" />
                  </Button>
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
                <Button
                  size="$2"
                  chromeless
                  onPress={() => reservePhoneForMfa(phone)}
                >
                  Use for MFA
                </Button>

                {user.phoneNumbers.length > 1 && (
                  <Button
                    chromeless
                    size="$2"
                    onPress={async () => handleDestroy(phone)}
                  >
                    <Trash size="18" />
                  </Button>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
