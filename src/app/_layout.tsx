import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 120,
          contentStyle: {
            backgroundColor: "#171E3C",
          },
        }}
      />
    </>
  );
}
