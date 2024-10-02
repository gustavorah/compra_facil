import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { styled } from "nativewind";

const Button = styled(TouchableOpacity);

interface CarrinhoItem {
    id: number;
    nome: string;
    quantidade: number;
}

const Carrinho = () => {
    const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); 
    const refs = useRef<{[key: number]: any}>({});

    useEffect(() => {
        const fetchCarrinho = async () => {
            try {
                const response = await fetch('http://192.168.0.104:3000/shopping-cart-products'); // Substitua pela URL correta
                if (!response.ok) {
                    throw new Error('Erro ao buscar produtos do carrinho');
                }
                const data = await response.json();
                setCarrinho(data); // Supondo que a resposta seja um array de CarrinhoItem
            } catch (error) {
                console.error(error);
            }
        };

        fetchCarrinho();
    }, []);

    const selectProduct = () => {
        if (selectedItemId === null) {
            setSelectedItemId(carrinho[0]?.id || null);
        } else {
            const currentIndex = carrinho.findIndex((item) => item.id === selectedItemId);
            const nextIndex = (currentIndex + 1) % carrinho.length;

            setSelectedItemId(carrinho[nextIndex].id);
        }
    };

    const removeProduct = () => {
        if (selectedItemId !== null) {
            setCarrinho((prevCarrinho) => 
                prevCarrinho.filter((item) => item.id !== selectedItemId)
            );
            setSelectedItemId(null);
        }
    };

    return (
        <>
            <View className="flex-1 items-center justify-center">
                {carrinho.map((item) => (
                    <View
                        ref={(el) => (refs.current[item.id] = el)}
                        key={item.id}
                        className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 ${selectedItemId === item.id ? 'border-blue-500' : ''}`}
                    >
                        <Text>{item.nome}</Text>
                        <Text>Quantidade: {item.quantidade}</Text>
                    </View>
                ))}
            </View>

            <View className="flex-row justify-around items-center flex-1">
                <View className="w-80 flex-row justify-between">
                    <Button
                        className="bg-blue-500 rounded-lg p-10"
                        onPress={selectProduct}
                    >
                        <Text className="text-white text-center">Selecionar</Text>
                    </Button>
                    <Button
                        className="bg-blue-500 rounded-lg p-10"
                        onPress={removeProduct}
                    >
                        <Text className="text-white text-center">Remover</Text>
                    </Button>
                </View>
            </View>
        </>
    );
};

export default Carrinho;
