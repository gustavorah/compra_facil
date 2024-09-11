import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{}}>
      <Tabs.Screen
        name="carrinho"
        options={{
          headerShown: false,
          title: "Carrinho",
        }}
      />
      <Tabs.Screen
        name="adicionar"
        options={{
          headerShown: false,
          title: "Adicionar",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
