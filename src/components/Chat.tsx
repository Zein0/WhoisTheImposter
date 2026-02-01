import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { t } from '../i18n';

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayerId: string | null;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  currentPlayerId,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-game-card rounded-t-3xl">
        {/* Header */}
        <View className="px-4 py-3 border-b border-white/10">
          <Text className="text-white text-lg font-bold">{t('game.chat')}</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-white/40 text-center">
                No messages yet...
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.playerId === currentPlayerId;
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Animated.View
                  key={`${msg.playerId}-${index}`}
                  entering={SlideInRight.delay(index * 50)}
                  className={`mb-3 ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  {!isOwnMessage && (
                    <Text className="text-primary-400 text-xs font-semibold mb-1">
                      {msg.playerName}
                    </Text>
                  )}
                  <View
                    className={`
                      px-4 py-2 rounded-2xl max-w-[80%]
                      ${isOwnMessage ? 'bg-primary-500' : 'bg-slate-700'}
                    `}
                  >
                    <Text className="text-white">{msg.message}</Text>
                  </View>
                  <Text className="text-white/30 text-xs mt-1">{time}</Text>
                </Animated.View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 border-t border-white/10 flex-row items-center gap-2">
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder={t('game.typeMessage')}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-full"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            maxLength={200}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputMessage.trim()}
            className={`
              w-12 h-12 rounded-full items-center justify-center
              ${inputMessage.trim() ? 'bg-primary-500' : 'bg-slate-700'}
            `}
          >
            <Text className="text-white text-xl">➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
