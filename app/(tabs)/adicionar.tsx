import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { styled } from "nativewind";

const Button = styled(TouchableOpacity);

interface Produto {
  id: number;
  nome: string;
  preco: string;
}

const adicionar = () => {
  const [produto, setProduto] = useState<Produto[]>([]);

  useEffect(() => {
    setProduto([
      {
        id: 1,
        nome: "produto 1",
        preco: "30",
      },
    ]);
  }, []);

  return (
    <>
      <View className="flex-1 justify-center items-center">
        <Text>Informações sobre o produto</Text>
        {produto.map((item) => (
          <View
            key={item.id}
            className="border-solid border-2 m-2 w-40 rounded-lg pl-2"
          >
            <Text>Nome: {item.nome}</Text>
            <Text>Preco: {item.preco}</Text>
            <Button className="bg-blue-500 rounded-lg mt-2 mb-2 mr-2">
              <Text className="text-white text-center">Saber mais</Text>
            </Button>
          </View>
        ))}
      </View>

      <View className="flex-1 justify-center items-center">
        <View>
          <Button className="bg-blue-500 w-40 p-10 rounded-lg">
            <Text className="text-white text-center">Adicionar</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default adicionar;
