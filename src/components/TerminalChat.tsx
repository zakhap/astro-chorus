'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AstrologyReading } from '@/types/astrology';
import { createPlanetaryCharacters, generateSystemPrompt } from '@/data/characters';

interface TerminalChatProps {
  reading: AstrologyReading;
  onBack: () => void;
}

export default function TerminalChat({ reading, onBack }: TerminalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const characters = createPlanetaryCharacters(reading);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start with empty messages
  useEffect(() => {
    setMessages([]);
  }, [reading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      character: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentInput = inputValue; // Capture input before clearing
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode'] as const;
    
    try {
      // Handle each planet individually to avoid Promise.all failure
      const planetPromises = planetKeys.map(async (planet, index) => {
        try {
          const response = await generatePlanetResponse(planet, currentInput);
          setTimeout(() => {
            setMessages(prev => [...prev, response]);
          }, index * 200);
          return response;
        } catch (error) {
          console.error(`Error with ${planet}:`, error);
          // Return error message for this planet
          const errorResponse = {
            id: `${planet}-error-${Date.now()}`,
            character: planet,
            content: `${planet.toUpperCase()}_ERROR: Connection failed`,
            timestamp: new Date()
          };
          setTimeout(() => {
            setMessages(prev => [...prev, errorResponse]);
          }, index * 200);
          return errorResponse;
        }
      });

      await Promise.allSettled(planetPromises);

    } catch (error) {
      console.error('Critical error:', error);
    } finally {
      // Ensure loading is always cleared
      setTimeout(() => {
        setLoading(false);
      }, Math.max(planetKeys.length * 200 + 500, 3000));
    }
  };

  const generatePlanetResponse = async (planet: keyof typeof characters, query: string): Promise<ChatMessage> => {
    const character = characters[planet];
    const systemPrompt = generateSystemPrompt(character, reading, query);
    
    const recentMessages = messages.slice(-6).map(msg => ({
      role: msg.character === 'user' ? 'user' as const : 'assistant' as const,
      content: `${msg.character === 'user' ? 'USER' : msg.character.toUpperCase()}: ${msg.content}`
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userMessage: query,
        conversationHistory: recentMessages
      })
    });

    if (!response.ok) throw new Error('Failed to get AI response');
    const data = await response.json();
    
    const planetPrefixes: Record<string, string> = {
      sun: `SOL_${reading.sun.sign.substring(0, 3).toUpperCase()}`,
      moon: `LUNA_${reading.moon.sign.substring(0, 3).toUpperCase()}`,
      mercury: `HERMES_${reading.mercury.sign.substring(0, 3).toUpperCase()}`,
      venus: `APHRODITE_${reading.venus.sign.substring(0, 3).toUpperCase()}`,
      mars: `ARES_${reading.mars.sign.substring(0, 3).toUpperCase()}`,
      jupiter: `ZEUS_${reading.jupiter.sign.substring(0, 3).toUpperCase()}`,
      saturn: `CHRONOS_${reading.saturn.sign.substring(0, 3).toUpperCase()}`,
      uranus: `PROMETHEUS_${reading.uranus.sign.substring(0, 3).toUpperCase()}`,
      neptune: `POSEIDON_${reading.neptune.sign.substring(0, 3).toUpperCase()}`,
      pluto: `HADES_${reading.pluto.sign.substring(0, 3).toUpperCase()}`,
      northNode: `DHARMA_${reading.northNode.sign.substring(0, 3).toUpperCase()}`
    };
    
    return {
      id: `${planet}-${Date.now()}`,
      character: planet,
      content: `${planetPrefixes[planet]}: ${data.response}`,
      timestamp: new Date()
    };
  };

  const formatAscendant = () => {
    const ascSign = Math.floor(reading.ascendant / 30);
    const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    return `${signs[ascSign]} ${(reading.ascendant % 30).toFixed(2)}°`;
  };

  return (
    <div className="min-h-screen bg-[rgb(222,212,198)] text-black font-mono flex flex-col">
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-[rgb(222,212,198)] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4">AstroChat</div>
          <div className="text-sm text-black/60">
            Optimized for Desktop,<br />
            temporarily
          </div>
        </div>
        {/* Credit */}
        <div className="absolute bottom-4 right-4 text-xs text-black/40">
          built by <a href="https://x.com/singsarg" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors">@singsarg</a>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[rgb(222,212,198)] h-screen">
          {/* Back Button - Fixed at Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onBack}
              className="text-sm text-black/60 hover:text-black transition-colors"
            >
              ← Back
            </button>
          </div>
          
          {/* Centered Container */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            <div className="w-[90%] max-w-5xl border border-black/30 p-12 bg-[rgb(222,212,198)]">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="text-xs text-black/60 mb-2">AstroChat - Your Astrological Reading</div>
                <div className="text-lg font-bold text-black">YOUR BIRTH CHART</div>
              </div>

              {/* Birth Data */}
              <div className="mb-4 text-xs">
                <div className="text-black/60 mb-1">Birth Information:</div>
                <div className="pl-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div>DATE: {reading.birthInfo.date}</div>
                  <div>TIME: {reading.birthInfo.time}</div>
                  <div>LOCATION: {reading.birthInfo.location.name.toUpperCase()}</div>
                  <div>TZ: {reading.timezone}</div>
                </div>
              </div>

              {/* Planets Table */}
              <div className="mb-4">
                <div className="border border-black/30 p-2">
                  <div className="text-black/60 mb-2 text-xs font-bold">PLANETARY POSITIONS</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                    {reading.planets && reading.planets.length > 0 ? (
                      reading.planets.map((planet, index) => {
                        const symbols: Record<string, string> = {
                          'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
                          'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 
                          'Pluto': '♇', 'North Node': '☊'
                        };
                        
                        return (
                          <div key={index} className="flex justify-between">
                            <span>{symbols[planet.name] || '●'} {planet.name.substring(0, 3).toUpperCase()}:</span>
                            <span>{planet.sign.substring(0, 3).toUpperCase()} {planet.degree.toFixed(1)}°{planet.retrograde ? 'Rx' : ''}</span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>☉ SUN:</span>
                          <span>{reading.sun.sign.substring(0, 3).toUpperCase()} {reading.sun.degree.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>☽ MOON:</span>
                          <span>{reading.moon.sign.substring(0, 3).toUpperCase()} {reading.moon.degree.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>☿ MERCURY:</span>
                          <span>{reading.mercury.sign.substring(0, 3).toUpperCase()} {reading.mercury.degree.toFixed(1)}°{reading.mercury.retrograde ? 'Rx' : ''}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Houses Table */}
                <div className="border border-black/30 p-2" id="houses-table">
                  <div className="text-black/60 mb-2 text-xs font-bold">HOUSES</div>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>ASC (1st):</span>
                      <span>{formatAscendant()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MC (10th):</span>
                      <span>{(reading.midheaven % 30).toFixed(1)}°</span>
                    </div>
                    {reading.houses && reading.houses.length > 0 ? (
                      reading.houses.map((house, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{house.number}H:</span>
                          <span>{house.sign.substring(0, 3).toUpperCase()} {house.degree.toFixed(1)}°</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-black/40">Houses not calculated</div>
                    )}
                  </div>
                </div>

                {/* Aspects Table */}
                <div className="border border-black/30">
                  <div className="p-2">
                    <div className="text-black/60 mb-2 text-xs font-bold">MAJOR ASPECTS</div>
                  </div>
                  <div className="h-64 overflow-y-auto px-2 pb-2">
                    <div className="space-y-0.5 text-[10px]">
                      {reading.aspects && reading.aspects.length > 0 ? (
                        reading.aspects.map((aspect, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{aspect.planet1.substring(0, 3)} {aspect.aspect.substring(0, 3)} {aspect.planet2.substring(0, 3)}</span>
                            <span>{aspect.orb.toFixed(1)}°</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-black/40">No aspects calculated</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
          
        </div>

        {/* Right Sidebar - Planetary Responses */}
        <div className="w-[28rem] bg-black/90 flex flex-col border-l-2 border-black/20 h-screen">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header - Fixed */}
            <div className="p-4 border-b border-green-400/30">
              <div className="text-xs text-green-600 mb-2">Planetary Responses:</div>
              <div className="text-[10px] text-green-400/50">
                [{currentTime.toLocaleTimeString()}] CHANNEL OPEN
              </div>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <div className={`${
                    msg.character === 'user' ? 'text-cyan-400' :
                    msg.character === 'sun' ? 'text-yellow-500' :
                    msg.character === 'moon' ? 'text-blue-400' :
                    msg.character === 'mercury' ? 'text-green-400' :
                    msg.character === 'venus' ? 'text-pink-400' :
                    msg.character === 'mars' ? 'text-red-400' :
                    msg.character === 'jupiter' ? 'text-purple-400' :
                    msg.character === 'saturn' ? 'text-gray-400' :
                    msg.character === 'uranus' ? 'text-cyan-300' :
                    msg.character === 'neptune' ? 'text-blue-500' :
                    msg.character === 'pluto' ? 'text-purple-600' :
                    msg.character === 'northNode' ? 'text-yellow-300' :
                    'text-white'
                  }`}>
                    <div className="font-bold mb-1">
                      {msg.character === 'user' ? '> USER_QUERY:' : ''}
                    </div>
                    <div className="pl-2 whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
                ))}
                
                {loading && (
                  <div className="text-xs text-green-600">
                    <div className="animate-pulse">
                      PROCESSING COSMIC DATA...
                      <span className="inline-block ml-2">
                        {['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][Math.floor(Date.now() / 100) % 10]}
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t border-green-400/30 p-4">
            <div className="text-xs text-green-600 mb-2">Ask the planets:</div>
            <div className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">{'>'}</span>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                className="flex-1 bg-transparent outline-none text-green-300 text-xs border border-green-400/30 focus:border-green-400 p-2 rounded resize-none min-h-[2.5rem] max-h-24 overflow-y-auto"
                placeholder="Enter cosmic query... (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
              />
            </div>
            {loading && (
              <div className="mt-2 text-center">
                <span className="text-green-600 animate-pulse text-xs">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}