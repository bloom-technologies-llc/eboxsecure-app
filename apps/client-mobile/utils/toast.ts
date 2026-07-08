import Toast from "react-native-toast-message";

export type ToastType = "success" | "error" | "info";

/**
 * App-wide toast helper.
 *
 * Replaces the previous `react-native-root-toast` usage, which crashed under the
 * New Architecture (Fabric) with "Cannot read property 'setNativeProps' of null"
 * (its ToastContainer calls `this._root.setNativeProps` on a null ref).
 *
 * Requires <Toast /> to be mounted once at the app root — see app/_layout.tsx.
 */
export function showToast(
  message: string,
  type: ToastType = "success",
  position: "top" | "bottom" = "top",
) {
  Toast.show({
    type,
    text1: message,
    position,
    visibilityTime: 3000,
  });
}
