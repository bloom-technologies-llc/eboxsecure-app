import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function SignUp() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text>Hello world! Sign up page</Text>
      </View>
    </SafeAreaView>
  );
}

// import * as React from "react";
// import { Button, SafeAreaView, TextInput, View } from "react-native";
// import { useRouter } from "expo-router";
// import { useSignUp } from "@clerk/clerk-expo";

// export default function SignUp() {
//   const { isLoaded, signUp, setActive } = useSignUp();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [pendingVerification, setPendingVerification] = React.useState(false);
//   const [code, setCode] = React.useState("");

//   const onSignUpPress = async () => {
//     if (!isLoaded) {
//       return;
//     }

//     try {
//       await signUp.create({
//         emailAddress,
//         password,
//       });

//       await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

//       setPendingVerification(true);
//     } catch (err: any) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   const onPressVerify = async () => {
//     if (!isLoaded) {
//       return;
//     }

//     try {
//       const completeSignUp = await signUp.attemptEmailAddressVerification({
//         code,
//       });

//       if (completeSignUp.status === "complete") {
//         await setActive({ session: completeSignUp.createdSessionId });
//         router.replace("/");
//       } else {
//         console.error(JSON.stringify(completeSignUp, null, 2));
//       }
//     } catch (err: any) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   return (
//     <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
//       <View>
//         {!pendingVerification && (
//           <>
//             <TextInput
//               autoCapitalize="none"
//               value={emailAddress}
//               placeholder="Email..."
//               onChangeText={(email) => setEmailAddress(email)}
//             />
//             <TextInput
//               value={password}
//               placeholder="Password..."
//               secureTextEntry={true}
//               onChangeText={(password) => setPassword(password)}
//             />
//             <Button title="Sign Up" onPress={onSignUpPress} />
//           </>
//         )}
//         {pendingVerification && (
//           <>
//             <TextInput
//               value={code}
//               placeholder="Code..."
//               onChangeText={(code) => setCode(code)}
//             />
//             <Button title="Verify Email" onPress={onPressVerify} />
//           </>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }
