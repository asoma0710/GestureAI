import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the top bar for all routes in this layout
      }}
    />
  );
}
