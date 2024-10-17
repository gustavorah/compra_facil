import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";
import * as Speak from "expo-speech";
import { LandPlot } from "lucide-react";

// const Button = styled(TouchableOpacity);

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
    const [touches, setTouches] = useState<number>(0);
    const [timer, setTimer] = useState<boolean | null>(null);

    const touchesRef = useRef(touches);
    const refs = useRef<{ [key: number]: any }>({});

    const fetchCarrinho = async () => {
        try {
            const response = await fetch('http://192.168.0.104:3000/shopping-cart-products');
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
            const response = await fetch(`http://192.168.0.104:3000/products/${productId}`);

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

    const selectProduct = async () => {        
        if (carrinho.length <= 0) {
            const speechStatus = await Speak.isSpeakingAsync();
            if (! speechStatus) {
                Speak.speak('Sem produtos no carrinho', {language: 'pt-br'});
            }
        }
        else {
            if (selectedItemId === null && carrinho.length > 0) {
                setSelectedItemId(carrinho[0]?.id || null);
                if (selectedItemId)
                {
                    speakSelectedProduct(produtos[carrinho[0].productId]);
                }
            } 
            else {
                const currentIndex = carrinho.findIndex((item) => item.id === selectedItemId);
                const nextIndex = (currentIndex + 1) % carrinho.length;
                setSelectedItemId(carrinho[nextIndex].id);

                if (selectedItemId)
                {
                    speakSelectedProduct(produtos[carrinho[nextIndex].productId]);
                }
            }
        }
    };

    const speakSelectedProduct = async (product: Product) => {
        const speechStatus = await Speak.isSpeakingAsync();
        if (! speechStatus) {
            Speak.speak(`Produto selecionado: ${product.name}, com valor de ${product.price} reais`, {language: 'pt-br'});
        }
    }

    const removeProduct = async () => {
        const productId = selectedItemId
        if (selectedItemId !== null && productId) {
            const response = await fetch(`http://192.168.0.104:3000/shopping-cart-products/${productId}`, {
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

    const addProduct = async () => {
        await speakSelectedProduct(produtos[0]);
    }

    useEffect(() => {
        touchesRef.current = touches;
    }, [touches])

    // Efeito para lidar com mudanças no valor do timer
    useEffect(() => {
        if (timer === true) {
            // Inicia o temporizador de 5 segundos
            console.log('iniciando temporizador');
            
            const timeout = setTimeout(() => {
                console.log('fim temporizador');
                
                setTimer(false);
                
                const touchesDone = touchesRef.current;
                switch (touchesDone) {
                    
                    case 1:
                        selectProduct();
                        break;
                    case 2:
                        addProduct();
                        break;
                    case 3:
                        Speak.speak('Deletar produto', {language: 'pt-br'});
                        break;
                    default:
                        Speak.speak(`Comando não reconhecido. 1 toque: Seleciona o primeiro ou próximo carrinho; 
                            2 toques: Deleta o produto do carrinho;
                            3 toques: Descreve os produtos do carrinho`, {language: 'pt-br', rate: 2.0});
                        break;
                }
                setTouches(0);
            }, 2000);

            // Limpeza caso o componente seja desmontado antes dos 5 segundos
            return () => clearTimeout(timeout);
        }
    }, [timer]); // O efeito roda quando o `timer` muda

    const startTimer = () => {
        setTimer(true);
    };

    const countTouches = () => {
        if (!timer) {
            startTimer();
        }

        // Incrementa a quantidade de toques
        setTouches(prevTouches => prevTouches + 1);

        console.log(`Toques: ${touches + 1}`);
    };

    return (
            <TouchableOpacity 
                style={{ flex: 1}}
                activeOpacity={1}
                onPress={countTouches}>

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
                        <Text className="text-6xl">Carrinho Vazio</Text>
                    )}
                </View>

                
            </TouchableOpacity>
    );
};

export default Carrinho;
