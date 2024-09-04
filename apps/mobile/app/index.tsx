import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Button, Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Seu carrinho</Text>

      <Button
        title="Iniciar"
        onPress={() => {
          router.push("/carrinho");
        }}
      />
    </View>
  );
}
