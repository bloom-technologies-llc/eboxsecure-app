import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";

export default function BackBreadcrumb() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      className="flex flex-row items-center self-start"
    >
      <CaretLeft />
      <Text>Back</Text>
    </Pressable>
  );
}
