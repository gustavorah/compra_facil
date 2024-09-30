import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { styled } from "nativewind";
import Microphone from "@/components/Microphone";
import * as Speech from 'expo-speech';

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

    const descricaoProduto = (item: Produto) => {
        const descricaoItem = `Produto selecionado: ${item.nome}, preço de ${item.preco} reais`;
        Speech.speak(descricaoItem, {language: "pt-br"});
    }

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
                <Button className="bg-blue-500 rounded-lg mt-2 mb-2 mr-2" onPress={() => descricaoProduto(item)}>
                    <Text className="text-white text-center">Saber mais</Text>
                </Button>
            </View>
            ))}

        </View>

        <Microphone 

        />

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
