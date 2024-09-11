import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { styled } from "nativewind";

const Button = styled(TouchableOpacity);

interface CarrinhoItem {
  id: number;
  nome: string;
  quantidade: number;
}

const Carrinho = () => {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [textButton, setTextButton] = useState("Selecionar");
  useEffect(() => {
    // Simulando uma adição de itens ao carrinho
    setCarrinho([
      { id: 1, nome: "Compra 1", quantidade: 2 },
      { id: 2, nome: "Compra 2", quantidade: 1 },
      { id: 3, nome: "Compra 3", quantidade: 5 },
    ]);
  }, []);

  const changeButton = () => {
    setTextButton(textButton === "Selecionar" ? "Remover" : "Selecionar");
  };
  return (
    <>
      <View className="flex-1 items-center justify-center">
        {carrinho.map((item) => (
          <View
            key={item.id}
            className="border-solid border-2 m-2 w-40 rounded-lg pl-2"
          >
            <Text>{item.nome}</Text>
            <Text>Quantidade: {item.quantidade}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row justify-around items-center flex-1">
        <View className="w-40 ">
          <Button
            className="bg-blue-500 rounded-lg p-10"
            onPress={changeButton}
          >
            <Text className="text-white text-center">{textButton}</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default Carrinho;
