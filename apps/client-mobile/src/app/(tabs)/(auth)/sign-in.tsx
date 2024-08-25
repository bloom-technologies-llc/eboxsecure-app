import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function SignIn() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text>Hello world! Sign in page</Text>
      </View>
    </SafeAreaView>
  );
}

// import React from "react";
// import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
// import { Link, useRouter } from "expo-router";
// import { useSignIn } from "@clerk/clerk-expo";

// export default function SignIn() {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");

//   const onSignInPress = React.useCallback(async () => {
//     if (!isLoaded) {
//       return;
//     }

//     try {
//       const signInAttempt = await signIn.create({
//         identifier: emailAddress,
//         password,
//       });

//       if (signInAttempt.status === "complete") {
//         await setActive({ session: signInAttempt.createdSessionId });
//         router.replace("/");
//       } else {
//         // See https://clerk.com/docs/custom-flows/error-handling
//         // for more info on error handling
//         console.error(JSON.stringify(signInAttempt, null, 2));
//       }
//     } catch (err: any) {
//       console.error(JSON.stringify(err, null, 2));
//     }
//   }, [isLoaded, emailAddress, password]);

//   return (
//     <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
//       <View>
//         <TextInput
//           autoCapitalize="none"
//           value={emailAddress}
//           placeholder="Email..."
//           onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
//         />
//         <TextInput
//           value={password}
//           placeholder="Password..."
//           secureTextEntry={true}
//           onChangeText={(password) => setPassword(password)}
//         />
//         <Button title="Sign In" onPress={onSignInPress} />
//       </View>
//     </SafeAreaView>
//   );
// }
