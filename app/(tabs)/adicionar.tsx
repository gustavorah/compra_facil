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
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); 

    useEffect(() => {
        setProduto([
        {
            id: 1,
            nome: "produto 1",
            preco: "30",
        },
        ]);
    }, []);

    const selectProduct = () => {
        if (selectedItemId === null) {
            setSelectedItemId(produto[0]?.id || null);
        }
        else {
            const currentIndex = produto.findIndex((item) => item.id == selectedItemId);
            const nextIndex = (currentIndex + 1) % produto.length;

            setSelectedItemId(produto[nextIndex].id);
        }
    };

    const adicionarProduto = () => {
        if (selectedItemId !== null) {
            
        }
    }

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
                    className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 ${selectedItemId == item.id ? 'border-blue-500' : ''}`}
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

            <View className="flex-row justify-around items-center flex-1">


                <View className="w-80 flex-row justify-between">
                    <Button 
                        className="bg-blue-500 w-40 p-10 rounded-lg"
                        onPress={adicionarProduto}    
                    >
                        <Text className="text-white text-center">Adicionar</Text>
                    </Button>

                    <Button
                        className="bg-blue-500 rounded-lg p-10"
                        onPress={selectProduct}
                    >
                    <Text className="text-white text-center">Selecionar</Text>
                    </Button>
                </View>
            </View>
        </>
    );
};

export default adicionar;
