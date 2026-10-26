import { Alert, Linking, Platform } from "react-native";

// One place that starts a phone call. Digits-only links (tel:911, tel:988,
// tel:+18002723900) work from normal screens and from inside Modals, on iPhone
// Safari (web) and in the installed app.
export function dial(number: string) {
  const digits = number.replace(/[^\d+]/g, "");
  if (!digits) return;
  const url = `tel:${digits}`;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
    return;
  }
  Linking.openURL(url).catch(() => {
    Alert.alert("Can't place a call here", `Dial ${number} from your phone's keypad.`);
  });
}
