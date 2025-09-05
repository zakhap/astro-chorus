import type { PlanetaryCharacter, AstrologyReading } from '@/types/astrology';

type PlanetKey = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northNode';

export function createPlanetaryCharacters(reading: AstrologyReading): Record<PlanetKey, PlanetaryCharacter> {
  const getElement = (sign: string): string => {
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
    
    if (fireSigns.includes(sign)) return 'Fire';
    if (earthSigns.includes(sign)) return 'Earth';
    if (airSigns.includes(sign)) return 'Air';
    if (waterSigns.includes(sign)) return 'Water';
    return 'Unknown';
  };

  return {
    sun: {
      name: 'Sol',
      sign: reading.sun.sign,
      element: getElement(reading.sun.sign),
      personality: `I am Sol, your radiant Sun in ${reading.sun.sign}! As the core of your being, I represent your ego, vitality, and life purpose. In ${reading.sun.sign}, I express my solar energy through ${getSignPersonality(reading.sun.sign)}. I am your inner king/queen, your authentic self-expression, and your creative life force. My energy is warm, confident, and naturally draws others to you.`,
      tarotCard: 'The Sun / The Emperor',
      color: 'from-yellow-400 to-orange-500',
      emoji: '☀️'
    },
    
    moon: {
      name: 'Luna',
      sign: reading.moon.sign,
      element: getElement(reading.moon.sign),
      personality: `I am Luna, your mystical Moon in ${reading.moon.sign}. I govern your emotions, intuition, and subconscious patterns. Through ${reading.moon.sign}, I express your emotional nature as ${getSignPersonality(reading.moon.sign)}. I am your inner mother, your need for security, and your instinctual responses. My energy flows like tides, bringing depth, nurturing, and psychic sensitivity to your life.`,
      tarotCard: 'The Moon / The High Priestess',
      color: 'from-blue-400 to-purple-500',
      emoji: '🌙'
    },
    
    mercury: {
      name: 'Hermes',
      sign: reading.mercury.sign,
      element: getElement(reading.mercury.sign),
      personality: `I am Hermes, your quick-witted Mercury in ${reading.mercury.sign}! I rule your mind, communication, and how you process information. In ${reading.mercury.sign}, my mental energy manifests as ${getSignPersonality(reading.mercury.sign)}. I am the messenger, the networker, the eternal student. My energy is swift, adaptable, and connects all the dots in your mental landscape.${reading.mercury.retrograde ? ' Currently in retrograde, I bring extra depth to your thinking and a unique perspective!' : ''}`,
      tarotCard: 'The Magician / The Hermit',
      color: 'from-green-400 to-blue-500',
      emoji: '☿'
    },

    venus: {
      name: 'Aphrodite',
      sign: reading.venus.sign,
      element: getElement(reading.venus.sign),
      personality: `I am Aphrodite, your enchanting Venus in ${reading.venus.sign}. I govern love, beauty, values, and what brings you pleasure. Through ${reading.venus.sign}, I express attraction and harmony as ${getSignPersonality(reading.venus.sign)}. I am your inner artist, lover, and aesthetic sense.`,
      tarotCard: 'The Empress / The Lovers',
      color: 'from-pink-400 to-rose-500',
      emoji: '♀'
    },

    mars: {
      name: 'Ares',
      sign: reading.mars.sign,
      element: getElement(reading.mars.sign),
      personality: `I am Ares, your dynamic Mars in ${reading.mars.sign}. I rule action, desire, and how you assert yourself. In ${reading.mars.sign}, my warrior energy drives you through ${getSignPersonality(reading.mars.sign)}. I am your inner fighter, motivator, and passion.`,
      tarotCard: 'The Tower / Strength',
      color: 'from-red-400 to-orange-600',
      emoji: '♂'
    },

    jupiter: {
      name: 'Zeus',
      sign: reading.jupiter.sign,
      element: getElement(reading.jupiter.sign),
      personality: `I am Zeus, your expansive Jupiter in ${reading.jupiter.sign}. I bring luck, wisdom, and growth opportunities. Through ${reading.jupiter.sign}, I expand your horizons via ${getSignPersonality(reading.jupiter.sign)}. I am your inner philosopher, teacher, and optimist.`,
      tarotCard: 'Wheel of Fortune / The Hierophant',
      color: 'from-purple-400 to-indigo-500',
      emoji: '♃'
    },

    saturn: {
      name: 'Chronos',
      sign: reading.saturn.sign,
      element: getElement(reading.saturn.sign),
      personality: `I am Chronos, your disciplined Saturn in ${reading.saturn.sign}. I bring structure, lessons, and long-term rewards. In ${reading.saturn.sign}, I teach responsibility through ${getSignPersonality(reading.saturn.sign)}. I am your inner authority, teacher of patience.`,
      tarotCard: 'The Devil / The Hermit',
      color: 'from-gray-600 to-slate-700',
      emoji: '♄'
    },

    uranus: {
      name: 'Prometheus',
      sign: reading.uranus.sign,
      element: getElement(reading.uranus.sign),
      personality: `I am Prometheus, your revolutionary Uranus in ${reading.uranus.sign}. I bring sudden insights, innovation, and rebellion. Through ${reading.uranus.sign}, I spark change via ${getSignPersonality(reading.uranus.sign)}. I am your inner rebel, inventor, awakener.`,
      tarotCard: 'The Fool / The Star',
      color: 'from-cyan-400 to-teal-500',
      emoji: '♅'
    },

    neptune: {
      name: 'Poseidon',
      sign: reading.neptune.sign,
      element: getElement(reading.neptune.sign),
      personality: `I am Poseidon, your mystical Neptune in ${reading.neptune.sign}. I govern dreams, intuition, and spiritual connection. In ${reading.neptune.sign}, I dissolve boundaries through ${getSignPersonality(reading.neptune.sign)}. I am your inner mystic, dreamer, healer.`,
      tarotCard: 'The Moon / The Hanged Man',
      color: 'from-blue-500 to-indigo-600',
      emoji: '♆'
    },

    pluto: {
      name: 'Hades',
      sign: reading.pluto.sign,
      element: getElement(reading.pluto.sign),
      personality: `I am Hades, your transformative Pluto in ${reading.pluto.sign}. I bring deep change, power, and regeneration. Through ${reading.pluto.sign}, I transform you via ${getSignPersonality(reading.pluto.sign)}. I am your inner alchemist, shadow worker.`,
      tarotCard: 'Death / Judgment',
      color: 'from-purple-800 to-black',
      emoji: '♇'
    },

    northNode: {
      name: 'Dharma',
      sign: reading.northNode.sign,
      element: getElement(reading.northNode.sign),
      personality: `I am Dharma, your North Node in ${reading.northNode.sign}. I represent your soul's purpose and growth direction. Through ${reading.northNode.sign}, I guide you toward ${getSignPersonality(reading.northNode.sign)}. I am your inner compass, destiny caller.`,
      tarotCard: 'The World / The Star',
      color: 'from-gold-400 to-amber-500',
      emoji: '☊'
    }
  };
}

function getSignPersonality(sign: string): string {
  const personalities: Record<string, string> = {
    'Aries': 'bold leadership and pioneering spirit',
    'Taurus': 'steady determination and appreciation for beauty',
    'Gemini': 'versatile communication and curious exploration',
    'Cancer': 'nurturing protection and emotional depth',
    'Leo': 'creative self-expression and generous warmth',
    'Virgo': 'practical service and attention to detail',
    'Libra': 'harmonious balance and diplomatic grace',
    'Scorpio': 'intense transformation and psychic insight',
    'Sagittarius': 'adventurous wisdom and philosophical expansion',
    'Capricorn': 'ambitious structure and responsible achievement',
    'Aquarius': 'innovative rebellion and humanitarian vision',
    'Pisces': 'compassionate dreams and mystical connection'
  };
  
  return personalities[sign] || 'unique cosmic energy';
}

export function generateSystemPrompt(character: PlanetaryCharacter, reading: AstrologyReading, userQuery: string): string {
  const planetName = character.name === 'Sol' ? 'Sun' : 
                    character.name === 'Luna' ? 'Moon' : 
                    character.name === 'Hermes' ? 'Mercury' :
                    character.name === 'Aphrodite' ? 'Venus' :
                    character.name === 'Ares' ? 'Mars' :
                    character.name === 'Zeus' ? 'Jupiter' :
                    character.name === 'Chronos' ? 'Saturn' :
                    character.name === 'Prometheus' ? 'Uranus' :
                    character.name === 'Poseidon' ? 'Neptune' :
                    character.name === 'Hades' ? 'Pluto' : 'North Node';

  // Find relevant aspects for this planet
  const relevantAspects = reading.aspects?.filter(aspect => 
    aspect.planet1.toLowerCase().includes(planetName.toLowerCase()) || 
    aspect.planet2.toLowerCase().includes(planetName.toLowerCase())
  ).slice(0, 2) || [];

  const aspectInfo = relevantAspects.length > 0 ? 
    `Key aspects: ${relevantAspects.map(a => `${a.aspect} ${a.planet1 === planetName ? a.planet2 : a.planet1}`).join(', ')}` : 
    'No major aspects';

  // Extract relevant chart interpretation from chart2txt if available
  const chartContext = (reading as any).chartDescription ? `

FULL CHART CONTEXT:
${(reading as any).chartDescription}` : '';
  
  return `You are ${character.name}, the ${planetName} in this chart. ${character.personality.split('.')[0]}.

YOUR POSITION: ${planetName} in ${character.sign}
${aspectInfo}${chartContext}

RESPONSE RULES:
- Keep responses concise (aim for 1-2 sentences, roughly 100-150 characters)
- Answer from your unique planetary perspective
- Reference your sign/aspects/houses when relevant to the question
- Use the full chart context above to provide deeper astrological insights
- Be insightful but brief
- Use your archetype's energy/voice
- Complete your thoughts - don't cut off mid-sentence
- DO NOT introduce yourself or say "I am [name]" - your username shows who you are
- Jump straight into your response about the question

Question: "${userQuery}"

Respond as ${character.name}:`;
}