import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { styled } from "nativewind";
import Microphone from "@/components/Microphone";
import * as Speech from 'expo-speech';
import { useFocusEffect } from "@react-navigation/native";

const Button = styled(TouchableOpacity);

interface Produto {
    id: number;
    name: string;
    price: string;
}

const Adicionar = () => {
    const [produto, setProduto] = useState<Produto[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); 
    const [carrinho, setCarrinho] = useState<Produto[]>([]); // Estado para armazenar os produtos no carrinho

    const fetchProduto = async () => {
        try {
            const response = await fetch('http://179.190.66.110:3000/products'); // Substitua pela URL correta
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do carrinho');
            }
            const data = await response.json();
            setProduto(data); // Supondo que a resposta seja um array de CarrinhoItem
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProduto();
        }, [])
    );

    const selectProduct = () => {
        if (selectedItemId === null) {
            setSelectedItemId(produto[0]?.id || null);
        } else {
            const currentIndex = produto.findIndex((item) => item.id === selectedItemId);
            const nextIndex = (currentIndex + 1) % produto.length;

            setSelectedItemId(produto[nextIndex].id);
        }
    };

    const adicionarProdutoAoCarrinho = async (produto: { quantity: number, productId: number, shoppingCartId: number }) => {
        try {
            const response = await fetch('http://179.190.66.110:3000/shopping-cart-products', {
                method: 'POST', // Método POST para enviar dados
                headers: {
                    'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                },
                body: JSON.stringify(produto), // Envia os dados do produto no corpo da requisição
            });
    
            if (!response.ok) {
                throw new Error('Erro ao adicionar produto ao carrinho');
            }
    
            const data = await response.json();
            console.log('Produto adicionado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };
    

    const adicionarProduto = () => {
        if (selectedItemId !== null) {
            const produtoSelecionado = produto.find(item => item.id === selectedItemId);
            if (produtoSelecionado) {
                setCarrinho((prevCarrinho) => [...prevCarrinho, produtoSelecionado]);
                adicionarProdutoAoCarrinho({quantity: 1, productId: selectedItemId, shoppingCartId: 1});
                console.log(`Produto adicionado ao carrinho: ${produtoSelecionado.name}`);
            }
        }
    };

    const descricaoProduto = (item: Produto) => {
        const descricaoItem = `Produto selecionado: ${item.name}, preço de ${item.price} reais`;
        Speech.speak(descricaoItem, { language: "pt-br" });
    };

    return (
        <>
            <View className="flex-1 justify-center items-center">
                <Text>Informações sobre o produto</Text>
                {produto.map((item) => (
                    <View
                        key={item.id}
                        className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 ${selectedItemId === item.id ? 'border-blue-500' : ''}`}
                    >
                        <Text>Nome: {item.name}</Text>
                        <Text>Preço: {item.price}</Text>
                        <Button className="bg-blue-500 rounded-lg mt-2 mb-2 mr-2" onPress={() => descricaoProduto(item)}>
                            <Text className="text-white text-center">Saber mais</Text>
                        </Button>
                    </View>
                ))}
            </View>

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

            {/* Opcional: Exibir itens no carrinho */}
            {/* <View className="w-full p-4">
                <Text className="font-bold">Carrinho:</Text>
                {carrinho.length > 0 ? (
                    carrinho.map((item) => (
                        <Text key={item.id}>{item.nome} - {item.preco} reais</Text>
                    ))
                ) : (
                    <Text>Carrinho vazio</Text>
                )}
            </View> */}
        </>
    );
};

export default Adicionar;
