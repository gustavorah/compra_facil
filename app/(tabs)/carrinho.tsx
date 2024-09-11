import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styled } from "nativewind";

type Props = {};

const Button = styled(TouchableOpacity);

const Carrinho = (props: Props) => {
  return (
    <>
      <View className="flex-1 items-center justify-center ">
        <View className="border-solid border-2 m-2 w-40 h-20">
          <Text>Compra 1</Text>
          <Text>Quantidade: </Text>
        </View>
        <View className="border-solid border-2 m-2 w-40">
          <Text>Compra 1</Text>
          <Text>Quantidade: </Text>
        </View>
        <View className="border-solid border-2 m-2 w-40">
          <Text>Compra 1</Text>
          <Text>Quantidade: </Text>
        </View>
      </View>

      <View className="flex-1 justify-between">
        <View className="w-40 ">
          <Button className="bg-blue-500 rounded-lg">
            <Text>Oi</Text>
          </Button>
        </View>
        <View>
          <Button className="bg-blue-500 rounded-lg">
            <Text>Oi</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Carrinho;
