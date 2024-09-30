import React, { useEffect, useState } from 'react';
import { Image, View, TouchableOpacity, Text, Alert, TouchableHighlight } from 'react-native';
import Voice, {
    SpeechRecognizedEvent,
    SpeechResultsEvent,
    SpeechErrorEvent,
  } from '@react-native-voice/voice';

const microphone = () => {
    const [recognized, setRecognized] = useState('');
    const [volume, setVolume] = useState('');
    const [error, setError] = useState('');
    const [end, setEnd] = useState('');
    const [started, setStarted] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [partialResults, setPartialResults] = useState<string[]>([]);

    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechRecognized = onSpeechRecognized;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
        Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
    
        return () => {
          Voice.destroy().then(Voice.removeAllListeners);
        };
      }, []);

    const onSpeechStart = (e: any) => {
        console.log('onSpeechStart: ', e);
        setStarted('√');
      };
    
    const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
        console.log('onSpeechRecognized: ', e);
        setRecognized('√');
    };

    const onSpeechEnd = (e: any) => {
        console.log('onSpeechEnd: ', e);
        setEnd('√');
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
        console.log('onSpeechError: ', e);
        setError(JSON.stringify(e.error));
    };

    const onSpeechResults = (e: SpeechResultsEvent) => {
        console.log('onSpeechResults: ', e);
        if (e.value) {
            setResults(e.value);
        }
    };

    const onSpeechPartialResults = (e: SpeechResultsEvent) => {
        console.log('onSpeechPartialResults: ', e);
        if (e.value) {
            setPartialResults(e.value);
        }
    };

    const onSpeechVolumeChanged = (e: any) => {
        console.log('onSpeechVolumeChanged: ', e);
        setVolume(e.value);
    };

    const _startRecognizing = async () => {
        _clearState();
        try {
            await Voice.start('pt-br');
            console.log('called start');
        } catch (e) {
            console.error(e);
        }
    };

    const _stopRecognizing = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    };

    const _cancelRecognizing = async () => {
        try {
            await Voice.cancel();
        } catch (e) {
            console.error(e);
        }
    };

    const _destroyRecognizer = async () => {
        try {
            await Voice.destroy();
        } catch (e) {
            console.error(e);
        }
        _clearState();
    };

    const _clearState = () => {
        setRecognized('');
        setVolume('');
        setError('');
        setEnd('');
        setStarted('');
        setResults([]);
        setPartialResults([]);
    };

    return (
        <View className="flex-1 justify-center items-center">
            
            <Text >Results</Text>
            {results.map((result, index) => {
                return (
                <Text key={`result-${index}`}>
                    {result}
                </Text>
                );
            })}
            <Text>Partial Results</Text>
            {partialResults.map((result, index) => {
                return (
                <Text key={`partial-result-${index}`}>
                    {result}
                </Text>
                );
            })}
            <TouchableOpacity onPress={_startRecognizing}>
                <Image 
                    source={require('../assets/images/button_microphone.png')}
                />
            </TouchableOpacity>
            <TouchableHighlight onPress={_stopRecognizing}>
                <Text>Stop Recognizing</Text>
            </TouchableHighlight>
        </View>
    )
}

export default microphone