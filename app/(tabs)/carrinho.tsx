import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";

const Button = styled(TouchableOpacity);

interface Product {
    id: number;
    name: string;
    price: string;
}

interface CarrinhoItem {
    id: number;
    quantity: number;
    product: Product;
    productId: number;
    shoppingCartId: number;
    createAt: string;
    updatedAt: string;
}

const Carrinho = () => {
    const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
    const [produtos, setProdutos] = useState<{[key: number]: Product}>({});
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const refs = useRef<{ [key: number]: any }>({});

    const fetchCarrinho = async () => {
        try {
            const response = await fetch('http://179.190.66.110:3000/shopping-cart-products');
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do carrinho');
            }
    
            const data: CarrinhoItem[] = await response.json();
            if (!data) {
                throw new Error('Dados do carrinho não encontrados');
            }
    
            setCarrinho(data);
            data.forEach(async (item) => {
                await fetchProduto(item.productId);
            });
        } catch (error: any) {
            console.error("Erro na requisição:", error.message); // Melhor mensagem de erro
            alert("Não foi possível carregar os itens do carrinho. Verifique sua conexão ou tente novamente mais tarde.");
        }
    };
    
    const fetchProduto = async (productId: number) => {
        try {
            console.log(productId);
            const response = await fetch(`http://179.190.66.110:3000/products/${productId}`);
            console.log(response);
            if (!response.ok) {
                throw new Error("Erro ao buscar o produto");
            }
    
            const data: Product = await response.json();
            if (!data) {
                throw new Error('Dados do produto não encontrados');
            }

            setProdutos(prevState => ({ ...prevState, [productId]: data }));
        } catch (error: any) {
            console.error("Erro ao buscar o produto:", error.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCarrinho();
        }, [])
    );

    const selectProduct = () => {
        if (selectedItemId === null && carrinho.length > 0) {
            setSelectedItemId(carrinho[0]?.id || null);
        } else {
            const currentIndex = carrinho.findIndex((item) => item.id === selectedItemId);
            const nextIndex = (currentIndex + 1) % carrinho.length;
            setSelectedItemId(carrinho[nextIndex].id);
        }
    };

    const removeProduct = async () => {
        const productId = selectedItemId
        if (selectedItemId !== null && productId) {
            const response = await fetch(`http://179.190.66.110:3000/shopping-cart-products/${productId}`, {
                method: 'DELETE', // Envia os dados do produto no corpo da requisição
            });
            if (!response.ok) {
                console.log("ao buscar o produto");
            }

            setCarrinho((prevCarrinho) =>
                prevCarrinho.filter((item) => item.id !== selectedItemId)
            );
            setSelectedItemId(null);
        }
    };

    return (
        <>
            <View className="flex-1 items-center justify-center mt-12">
                {carrinho.length > 0 ? (
                    carrinho.map((item) => {
                        const produto = produtos[item.productId];
                        // console.log(produtos[item.productId]);
                        return produto ? (
                            <View
                                ref={(el) => (refs.current[item.id] = el)}
                                key={item.id}
                                className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 ${selectedItemId === item.id ? 'border-blue-500' : ''}`}
                            >
                                <Text>Produto: {produto.name}</Text>
                                <Text>Preço: {produto.price}</Text>
                                <Text>Quantidade: {item.quantity}</Text>
                            </View>
                        ) : (
                            <Text key={item.id}>Carregando produto...</Text>
                        );
                    })
                ) : (
                    <Text>Carrinho Vazio</Text>
                )}
            </View>

            {carrinho.length > 0 && (
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
            )}
        </>
    );
};

export default Carrinho;
