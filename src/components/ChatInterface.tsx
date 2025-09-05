'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AstrologyReading } from '@/types/astrology';
import { createPlanetaryCharacters, generateSystemPrompt } from '@/data/characters';
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  reading: AstrologyReading;
  onBack: () => void;
}

export default function ChatInterface({ reading, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const characters = createPlanetaryCharacters(reading);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting from the planets
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        character: 'sun',
        content: `Greetings! I am Sol, your Sun in ${reading.sun.sign}. ☀️ I'm here with Luna and Hermes to discuss your cosmic blueprint!`,
        timestamp: new Date()
      },
      {
        id: '2', 
        character: 'moon',
        content: `Welcome, dear one. I am Luna, your Moon in ${reading.moon.sign}. 🌙 I feel your emotional depths and intuitive wisdom.`,
        timestamp: new Date()
      },
      {
        id: '3',
        character: 'mercury',
        content: `Hello there! Hermes here, your Mercury in ${reading.mercury.sign}${reading.mercury.retrograde ? ' in retrograde' : ''}. ☿ Ready to explore the mysteries of your mind and communication?`,
        timestamp: new Date()
      }
    ];
    
    setMessages(initialMessages);
  }, [reading]);

  const getCharacterStyle = (character: string) => {
    const styles = {
      sun: {
        gradient: 'from-yellow-400 to-orange-500',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30'
      },
      moon: {
        gradient: 'from-blue-400 to-purple-500', 
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30'
      },
      mercury: {
        gradient: 'from-green-400 to-blue-500',
        bg: 'bg-green-500/20', 
        border: 'border-green-500/30'
      },
      user: {
        gradient: 'from-pink-400 to-purple-500',
        bg: 'bg-pink-500/20',
        border: 'border-pink-500/30'
      }
    };
    return styles[character as keyof typeof styles] || styles.user;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      character: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Get responses from all three planets
      const planetResponses = await Promise.all([
        generatePlanetResponse('sun', inputValue),
        generatePlanetResponse('moon', inputValue), 
        generatePlanetResponse('mercury', inputValue)
      ]);

      // Add planet responses with slight delays for natural conversation flow
      planetResponses.forEach((response, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, response]);
        }, index * 1000);
      });

    } catch (error) {
      console.error('Error generating responses:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        character: 'sun',
        content: 'I apologize, but we\'re having trouble connecting to the cosmic network right now. Please try again!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generatePlanetResponse = async (planet: 'sun' | 'moon' | 'mercury', query: string): Promise<ChatMessage> => {
    const character = characters[planet];
    const systemPrompt = generateSystemPrompt(character, reading, query);
    
    // Include recent conversation history for context
    const recentMessages = messages.slice(-6).map(msg => ({
      role: msg.character === 'user' ? 'user' as const : 'assistant' as const,
      content: `${msg.character === 'user' ? '' : `${msg.character}: `}${msg.content}`
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemPrompt,
        userMessage: query,
        conversationHistory: recentMessages
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    
    return {
      id: `${planet}-${Date.now()}`,
      character: planet,
      content: data.response,
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Planetary Council</h1>
            <p className="text-sm text-gray-300">
              {reading.sun.sign} Sun • {reading.moon.sign} Moon • {reading.mercury.sign} Mercury
            </p>
          </div>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const style = getCharacterStyle(message.character);
          const isUser = message.character === 'user';
          
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${style.bg} ${style.border} border rounded-2xl p-4 backdrop-blur-sm`}>
                {!isUser && (
                  <div className="flex items-center mb-2">
                    <span className={`text-sm font-semibold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                      {message.character === 'sun' ? 'Sol ☀️' : 
                       message.character === 'moon' ? 'Luna 🌙' : 
                       message.character === 'mercury' ? 'Hermes ☿' : 'You'}
                    </span>
                  </div>
                )}
                <p className="text-white text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-white/60 text-sm">The planets are consulting...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the planets anything about your chart..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}