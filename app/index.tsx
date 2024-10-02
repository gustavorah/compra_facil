import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { styled } from "nativewind";

const Button = styled(TouchableOpacity);

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl">Seu carrinho</Text>

      <View className="w-40">
        <Button
          className="bg-blue-500 p-4 rounded-lg"
          onPress={() => {
            router.push("/carrinho");
          }}
        >
          <Text className="text-white text-center">Iniciar</Text>
        </Button>
      </View>
    </View>
  );
}
