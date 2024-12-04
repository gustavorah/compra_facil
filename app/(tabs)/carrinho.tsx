import { View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from "react-native";
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

    const touchesRef = useRef(touches);
    const refs = useRef<{ [key: number]: any }>({});

   // Inicializa o NFC
   useEffect(() => {
    const initNfc = async () => {
        try {
            // First check if NFC is supported
            const isSupported = await NfcManager.isSupported();
            if (!isSupported) {
                console.warn("NFC not supported on this device");
                return;
            }

            // Then check if it's enabled
            const isEnabled = await NfcManager.isEnabled();
            if (!isEnabled) {
                console.warn("NFC is not enabled");
                return;
            }

            await NfcManager.start();
            setIsNfcEnabled(true);
            console.log("NFC Manager initialized successfully");

            // Set up the event listener for tag discovery
            NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTagDiscovered);
            
            // Start scanning
            startScanning();

        } catch (error) {
            console.error("Error during NFC initialization:", error);
            await cleanupNfc();
        }
    };

    initNfc();

    // Cleanup when component unmounts
    return () => {
        cleanupNfc();
    };
}, []);

const startScanning = async () => {
    try {
        setIsScanning(true);
        // Cancel any existing scanning session
        await NfcManager.cancelTechnologyRequest();
        
        // Start a new scanning session
        await NfcManager.requestTechnology(NfcTech.Ndef);
        
        console.log("Started scanning for NFC tags...");
    } catch (error) {
        console.error("Error starting NFC scan:", error);
        await cleanupNfc();
    }
};

const handleTagDiscovered = async (tag: any) => {
    try {
        console.log("Raw tag data:", tag);
        
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

        await fetchProdutoByTag(text);
        setAdicionar(true);

        speak(`Produto encontrado: ${productTag?.name || 'desconhecido'}, 
               com valor de ${productTag?.price || 0} reais`);

        Speak.speak(`1 toque: descreve o produto.
                    2 toques: adiciona o produto para o carrinho.
                    3 toques: não adiciona o produto.`);

    } catch (error) {
        console.error("Error processing NFC tag:", error);
    } finally {
        // Restart scanning after processing the tag
        await startScanning();
    }
};

const cleanupNfc = async () => {
    try {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        await NfcManager.cancelTechnologyRequest();
        setIsScanning(false);
    } catch (error) {
        console.error("Error during NFC cleanup:", error);
    }
};

    const fetchCarrinho = async () => {
        try {
            
            const response = await fetch('http://177.44.248.73:3000/shopping-cart-products');
            
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
            
            alert('http://177.44.248.73:3000/shopping-cart-products');
            alert(error);
        }
    };

    const fetchProdutoByTag = async (tag: any) => {
        try {
            const response = await fetch(`http://177.44.248.73:3000/tags/${tag}/products`);
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
            const response = await fetch(`http://177.44.248.73:3000/products/${productId}`);

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
            const response = await fetch(`http://177.44.248.73:3000/shopping-cart-products/${productId}`, {
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
                            Speak.speak(`Manual de uso. 1 toque: Seleciona o primeiro ou próximo carrinho; 
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
            const response = await fetch('http://177.44.248.73:3000/shopping-cart-products', {
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

        speak(`Valor total do carrinho: ${produtosArray.reduce((acc, item) => acc + parseFloat(item.price), 0)} reais`);
    }

    const stopSpeaking = async () => {
        const isSpeaking = await Speak.isSpeakingAsync();
        if (isSpeaking) { // Verifica se está falando
            Speak.stop();
        }
    };

    const speak = (text: string) => {
        Speak.speak(text, {language: 'pt-br'});
    }

    return (
        <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={countTouches}
        >
            <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
                {/* Add NFC status indicators */}
                <TouchableWithoutFeedback onPress={stopSpeaking}>
                <View className="p-4">
                    <Text className="text-sm text-gray-600">
                        NFC Status: {isNfcEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        Scanning: {isScanning ? 'Active' : 'Inactive'}
                    </Text>
                </View>
                </TouchableWithoutFeedback>
                

                {/* Rest of your existing JSX */}
                
            </ScrollView>
        </TouchableOpacity>
    );
};

export default Carrinho;
