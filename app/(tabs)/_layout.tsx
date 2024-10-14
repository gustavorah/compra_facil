import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import {Plus} from 'lucide-react'
import { FontAwesome } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{
    }}>
      <Tabs.Screen
        name="carrinho"
        options={{
          headerShown: false,
          title: "Carrinho",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="shopping-cart" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
