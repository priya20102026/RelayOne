import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import { ThemeColors } from "../theme";

export default function MotivationalQuote({ quote }: { quote: string }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{quote}</Text>
    </View>
  );
}

const makeStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: theme.primarySoft,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    text: { color: theme.text, fontSize: 14, fontStyle: "italic", lineHeight: 20 },
  });
