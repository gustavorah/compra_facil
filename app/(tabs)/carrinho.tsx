import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Speak from "expo-speech";
import NfcManager, {NfcEvents, NfcTech} from "react-native-nfc-manager";

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
    const [produtos, setProdutos] = useState<Product[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [touches, setTouches] = useState<number>(0);
    const [timer, setTimer] = useState<boolean | null>(null);
    const [adicionar, setAdicionar] = useState<boolean>(false);
    const [productId, setProductId] = useState<number | null>(null);
    const [productTag, setProductTag] = useState<{name: string, price: number} | null>(null);

    const touchesRef = useRef(touches);
    const refs = useRef<{ [key: number]: any }>({});

   // Inicializa o NFC
   useEffect(() => {
        async function initNfc() {
            try {
                await NfcManager.start();
                console.log("NFC Manager iniciado com sucesso.");
                NfcManager.setEventListener(NfcEvents.DiscoverTag, onTagDiscovered);
            } catch (error) {
                console.error("Erro ao iniciar o NFC Manager:", error);
            }
        }

        // Função de callback para quando uma tag NFC é descoberta
        const onTagDiscovered = async (tag: any) => {
            if (tag) {
                await fetchProdutoByTag(tag);
                console.log("Tag descoberta:", tag);
                setAdicionar(true);
                // setProductId(tag.productId);

                speak(`Produto encontrado: ${tag.name}, com valor de ${tag.price} reais`);
                
                // Função de voz descrevendo os toques
                Speak.speak(`1 toque: descreve o produto.
                    2 toques: adiciona o produto para o carrinho.
                    3 toques: não adiciona o produto.`);
                
                // Desativa o modo de leitura logo após a detecção
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            } else {
                console.log("Nenhuma tag NFC detectada.");
            }
        };

        initNfc();

        // Limpa o listener ao desmontar o componente
        return () => {
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            // NfcManager.stop();  // Opcionalmente, desative o NFC Manager ao sair do componente
        };
    }, []);

    const fetchCarrinho = async () => {
        try {
            const response = await fetch('http://192.168.0.28:3000/shopping-cart-products');
            
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

    const fetchProdutoByTag = async (tag: any) => {
        try {
            const response = await fetch(`http://192.168.0.28:3000/tags/${tag}/products`);
            if (!response.ok) {
                throw new Error("Erro ao buscar o produto");
            }

            const data: {name: string, price: number} = await response.json();
            if (!data) {
                throw new Error('Dados do produto não encontrados');
            }

            setProductTag(data);

        }
        catch (error: any) {
            console.error("Erro ao buscar o produto:", error.message);
        }
    }
    
    const fetchProduto = async (productId: number) => {
        try {
            const response = await fetch(`http://192.168.0.28:3000/products/${productId}`);

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
            speak(`Produto selecionado: ${product.name}, com valor de ${product.price} reais`);
        }
    }

    const removeProduct = async () => {
        const productId = selectedItemId
        if (selectedItemId !== null && productId) {
            const response = await fetch(`http://192.168.0.28:3000/shopping-cart-products/${productId}`, {
                method: 'DELETE', // Envia os dados do produto no corpo da requisição
            });
            if (!response.ok) {
                console.log("ao buscar o produto");
            }

            setCarrinho((prevCarrinho) =>
                prevCarrinho.filter((item) => item.id !== selectedItemId)
            );
            setSelectedItemId(null);

            Speak.speak('Produto deletado', {language: 'pt-br'});
        }
    };

    useEffect(() => {
        touchesRef.current = touches;
    }, [touches]);

    // Efeito para lidar com mudanças no valor do timer
    useEffect(() => {
        if (timer === true) {
            // Inicia o temporizador de 5 segundos
            console.log('iniciando temporizador');
            
            const timeout = setTimeout(() => {
                console.log('fim temporizador');
                
                setTimer(false);
                
                const touchesDone = touchesRef.current;
                if (! adicionar)
                {
                    switch (touchesDone) {
                        
                        case 1:
                            selectProduct();
                            break;
                        case 2:
                            removeProduct();
                            // addProduct();
                            break;
                        case 3:
                            listarCarrinho();
                            break;
                        default:
                            Speak.speak(`Comando não reconhecido. 1 toque: Seleciona o primeiro ou próximo carrinho; 
                                2 toques: Deleta o produto do carrinho;
                                3 toques: Descreve os produtos do carrinho`, {language: 'pt-br', rate: 2.0});
                            break;
                    }
                }
                else if (adicionar && productId)
                {
                    // let productId = 1;
                    switch (touchesDone) {
                        case 1:
                            speakSelectedProduct(produtos[productId]);
                            break;
                        case 2:
                            adicionarProduto(productId);
                            speak('Produto adicionado ao carrinho');
                            setAdicionar(false);
                        default:
                            break;
                    }
                }
                setTouches(0);
            }, 2000);

            // Limpeza caso o componente seja desmontado antes dos 5 segundos
            return () => clearTimeout(timeout);
        }
    }, [timer]); // O efeito roda quando o `timer` muda

    const adicionarProduto = (productId: number) => {
        if (productId) {
            const produtoSelecionado = produtos[productId];
            if (produtoSelecionado) {
                adicionarProdutoAoCarrinho({quantity: 1, productId: productId, shoppingCartId: 1});
                console.log(`Produto adicionado ao carrinho: ${produtoSelecionado.name}`);
                fetchCarrinho();
            }
        }
    };

    const adicionarProdutoAoCarrinho = async (produto: { quantity: number, productId: number, shoppingCartId: number }) => {
        try {
            const response = await fetch('http://192.168.0.28:3000/shopping-cart-products', {
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

    const listarCarrinho = () => {
        speak("Produtos no seu carrinho");
        
        const produtosArray = Object.values(produtos);
        produtosArray.forEach((item, index) => {
            index++;   
            speak(`Produto ${index}: ${item.name}`);
        });
    }

    const speak = (text: string) => {
        Speak.speak(text, {language: 'pt-br'});
    }

    return (
            <TouchableOpacity 
                style={{ flex: 1}}
                activeOpacity={1}
                onPress={countTouches}>

                <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>

                    <View className="flex-1 items-center justify-center mt-12">
                        {carrinho.length > 0 && ! adicionar ? (
                            carrinho.map((item, index) => {
                                index++;
                                const produto = produtos[item.productId];
                                
                                return produto ? (
                                    <>
                                        <View
                                            ref={(el) => (refs.current[item.id] = el)}
                                            key={item.id}
                                            className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 ${selectedItemId === item.id ? 'border-blue-500' : ''}`}
                                        >
                                            <Text>Produto: {produto.name}</Text>
                                            <Text>Preço: {produto.price}</Text>
                                            <Text>Quantidade: {item.quantity}</Text>
                                        </View>

                                        <Text>Produto: {index}</Text>
                                    </>
                                ) : (
                                    <Text key={item.id}>Carregando produto...</Text>
                                );
                            })
                        ) : adicionar ? (
                            (() => {
                                // let productId = 1;
                                if (productId) {
                                    const produto = produtos[productId];

                                    return produto ? (
                                        <View
                                        className={`border-solid border-2 m-2 w-40 rounded-lg pl-2 border-red-500`}
    >
                                            <Text>Produto encontrado: {produto.name}</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-6xl">Produto não encontrado</Text>
                                    );
                                }
                                return null;
                            })()

                        ) : (
                            <Text className="text-6xl">Carrinho Vazio</Text>
                        )}
                    </View>
                </ScrollView>

                
            </TouchableOpacity>
    );
};

export default Carrinho;
