import React, { useState, useRef, useEffect } from 'react';
import CustomScreenWrapper from '~/components/CustomScreenWraper';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { GoogleGenAI } from '@google/genai';

type Author = 'user' | 'bot';
interface Message {
  id: string;
  text: string;
  author: Author;
}
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const callGeminiAPI = async (prompt: string): Promise<string> => {
    setLoading(true);
    try {
      const result = await genAI.models.generateContent({
        model: 'gemma-3n-e4b-it',
        contents: prompt,
      });
      const response = result.text;
      return response?.toString() || 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
    } catch (error) {
      console.error('Error al llamar al SDK de Gemini:', error);
      return 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      author: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    const botResponseText = await callGeminiAPI(currentInput);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      author: 'bot',
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.author === 'user';
    return (
      <View
        className={`max-w-[80%] rounded-2xl p-3 ${isUser ? 'self-end bg-blue-500' : 'self-start bg-gray-300'}`}>
        <Text className={`${isUser ? 'text-white' : 'text-black'}`}>{item.text}</Text>
      </View>
    );
  };

  return (
    <CustomScreenWrapper className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="px-2"
          contentContainerClassName="gap-2"
          contentContainerStyle={{ paddingTop: 10 }}
        />
        {loading && <ActivityIndicator size="small" color="#007AFF" className="my-2" />}
        <View className="flex-row items-center gap-2 border-t border-gray-300 bg-white p-2">
          <TextInput
            className="h-10 flex-1 rounded-2xl bg-gray-200 px-4 text-justify"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#999"
            onSubmitEditing={handleSend}
          />
          <Pressable
            className="rounded-2xl bg-blue-500 p-2 px-4 active:bg-green-600"
            onPress={handleSend}
            disabled={loading}>
            <Text className="text-base font-bold text-white">Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </CustomScreenWrapper>
  );
}
