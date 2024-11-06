import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Speak from "expo-speech";
import NfcManager, {Ndef, NfcEvents, NfcTech} from "react-native-nfc-manager";

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
    const [isNfcEnabled, setIsNfcEnabled] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [tagContent, setTagContent] = useState<string | null>(null);

    const touchesRef = useRef(touches);
    const refs = useRef<{ [key: number]: any }>({});

    useEffect(() => {
        const initNfc = async () => {
            try {
                const isSupported = await NfcManager.isSupported();
                if (!isSupported) {
                    console.warn("NFC not supported on this device");
                    return;
                }

                await NfcManager.start();
                setIsNfcEnabled(true);
                console.log("NFC Manager initialized successfully");

                // Register event listener
                NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
                    console.log("Tag discovered:", tag);
                    handleTagDiscovered(tag);
                });

                // Start scanning immediately
                readNdefTag();

            } catch (error) {
                console.error("Error during NFC initialization:", error);
                await cleanupNfc();
            }
        };

        initNfc();

        return () => {
            cleanupNfc();
        };
    }, []);

    const readNdefTag = async () => {
        try {
            setIsScanning(true);
            
            // Cancel any existing scanning session
            await NfcManager.cancelTechnologyRequest();

            // Start scanning loop
            await NfcManager.registerTagEvent();
            
            console.log("Started scanning for NFC tags...");
        } catch (error) {
            console.error("Error starting NFC scan:", error);
            await cleanupNfc();
        }
    };

    const handleTagDiscovered = async (tag: any) => {
        try {
            if (!tag.ndefMessage || !tag.ndefMessage.length) {
                console.warn("No NDEF message found on tag");
                return;
            }
            
            const ndefMessage = tag.ndefMessage[0];
            if (!ndefMessage) {
                console.warn("Invalid NDEF message format");
                return;
            }
    
            const text = Ndef.text.decodePayload(ndefMessage.payload);
            console.log("Decoded tag content:", text);

            const data = await fetchProdutoByTag(text);
            console.log('produto:');
            console.log(data);
            setAdicionar(true);
            speak(`Produto encontrado: ${data?.name || 'desconhecido'}, com valor de ${data?.price || 0} reais`);
        } catch (error) {
            readNdefTag();
            console.error("Error processing NFC tag:", error);
        }
        finally {
            await readNdefTag();
        }
    };

    const cleanupNfc = async () => {
        try {
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            await NfcManager.unregisterTagEvent();
            await NfcManager.cancelTechnologyRequest();
            setIsScanning(false);
        } catch (error) {
            console.error("Error during NFC cleanup:", error);
        }
    };

    const fetchCarrinho = async () => {
        try {
            const response = await fetch('http://192.168.73.203:3000/shopping-cart-products');
            
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
            const response = await fetch(`http://192.168.73.203:3000/tags/${tag}/products`);
            
            if (!response.ok) {
                throw new Error("Erro ao buscar o produto");
            }

            const data: {id: number, name: string, price: number} = await response.json();

            if (!data) {
                throw new Error('Dados do produto não encontrados');
            }

            setProductTag(data);
            setProductId(data.id)

            return data;
        }
        catch (error: any) {
            readNdefTag();
            console.error("Erro ao buscar o produto:", error.message);
        }
    }
    
    const fetchProduto = async (productId: number) => {
        try {
            const response = await fetch(`http://192.168.73.203:3000/products/${productId}`);

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
                if (selectedItemId === null)
                {
                    speakSelectedProduct(produtos[carrinho[0].productId]);
                }
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
            const response = await fetch(`http://192.168.73.203:3000/shopping-cart-products/${productId}`, {
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

            fetchCarrinho();
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
                            fetchCarrinho();
                            break;
                        case 3:
                            setAdicionar(false);
                            break;
                        default:
                            speak(`1 Toque: Descreve o produto descoberto;
                                   2 Toques: Adiciona o produto ao carrinho.`)
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
            const response = await fetch('http://192.168.73.203:3000/shopping-cart-products', {
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
        
        carrinho.forEach((item, index) => {
            const produto = produtos[item.productId];
            speak(`Item ${index + 1}: ${produto.name}`);
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
                                            className={`border-solid border-4 m-4 w-48 rounded-lg p-4 ${selectedItemId === item.id ? 'border-blue-700' : 'border-gray-400'}`}
                                            accessible={true}
                                            accessibilityLabel={`Produto: ${produto.name}, Preço: ${produto.price}, Quantidade: ${item.quantity}`}
                                            onAccessibilityAction={(event) => {
                                                if (event.nativeEvent.actionName === "activate") {
                                                    setSelectedItemId(item.id);
                                                    Vibration.vibrate(100);  // Feedback ao toque,
                                                }
                                            }}
                                        >
                                            <Text className="text-lg font-bold text-black" style={{ marginBottom: 4 }}>
                                                Produto: {produto.name}
                                            </Text>
                                            <Text className="text-md text-gray-700" style={{ marginBottom: 4 }}>
                                                Preço: R$ {produto.price}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <Text key={item.id}>Carregando produto...</Text>
                                );
                            })
                        ) : adicionar ? (
                            (() => {
                                if (productId) {
                                    const produto = produtos[productId];
                                    console.log('sdkfskd', produtos, produto, productId);
                                    
                                    return produto ? (
                                        <View
                                        key={productId}
                                        className="border-2 border-red-500 rounded-lg m-2 p-4 w-44 shadow-lg bg-white items-center justify-center"
                                        >
                                        <Text className="text-center text-lg font-semibold text-gray-800">
                                            Produto encontrado:
                                        </Text>
                                        <Text className="text-center text-base text-gray-600 mt-1">
                                            {produto.name}
                                        </Text>
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


            </TouchableOpacity>
    );
};

export default Carrinho;
