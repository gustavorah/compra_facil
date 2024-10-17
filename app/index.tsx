import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { styled } from "nativewind"; 

const Button = styled(TouchableOpacity);

export default function App() {

  return (
    <View className="flex-1 items-center justify-center bg-white">

      <View className="w-full">
        <Button
          className="bg-blue-500 h-full p-4 flex items-center justify-center"
          onPress={() => {
            router.push("/carrinho");
          }}
        >
          <Text className="text-white text-center text-5xl">Iniciar</Text>


        </Button>
      </View>
    </View>
  );
}
