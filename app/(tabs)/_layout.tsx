import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="carrinho"
        options={{
          headerShown: false,
          title: "Carrinho",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
