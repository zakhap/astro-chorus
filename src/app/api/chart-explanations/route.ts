import { NextRequest, NextResponse } from 'next/server';
import type { AstrologyReading } from '@/types/astrology';

export async function POST(request: NextRequest) {
  try {
    const { reading } = await request.json();
    
    if (!reading) {
      return NextResponse.json(
        { error: 'Missing astrology reading data' },
        { status: 400 }
      );
    }

    // Generate the three comprehensive default messages
    const explanations = await generateChartExplanations(reading);
    
    return NextResponse.json({
      explanations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    console.error('Chart explanation error:', error);
    return NextResponse.json(
      { error: `Failed to generate chart explanations: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function generateChartExplanations(reading: AstrologyReading) {
  const explanations = [];
  
  // 1. Planetary Positions Explanation
  const planetaryExplanation = generatePlanetaryPositionsExplanation(reading);
  explanations.push({
    id: 'planetary-positions',
    title: 'Your Planetary Blueprint',
    content: planetaryExplanation
  });
  
  // 2. House System Explanation  
  const houseExplanation = generateHouseSystemExplanation(reading);
  explanations.push({
    id: 'house-system',
    title: 'Your Life Areas & Houses',
    content: houseExplanation
  });
  
  // 3. Major Aspects Explanation
  const aspectsExplanation = generateAspectsExplanation(reading);
  explanations.push({
    id: 'major-aspects', 
    title: 'Your Planetary Relationships',
    content: aspectsExplanation
  });
  
  return explanations;
}

function generatePlanetaryPositionsExplanation(reading: AstrologyReading): string {
  const { sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, ascendant } = reading;
  
  // Calculate Ascendant sign
  const ascendantSign = getSignFromLongitude(ascendant);
  
  return `**Core Identity**

Sun ${sun.sign} ${sun.degree.toFixed(1)}° - ${getSignDescription(sun.sign, 'Sun')}

Moon ${moon.sign} ${moon.degree.toFixed(1)}° - ${getSignDescription(moon.sign, 'Moon')}

Ascendant ${ascendantSign} - How you appear to others and approach new situations.

**Communication & Relationships**

Mercury ${mercury.sign} ${mercury.degree.toFixed(1)}°${mercury.retrograde ? ' (Rx)' : ''} - ${getSignDescription(mercury.sign, 'Mercury')}${mercury.retrograde ? ' Retrograde brings deep, reflective thinking.' : ''}

Venus ${venus.sign} ${venus.degree.toFixed(1)}°${venus.retrograde ? ' (Rx)' : ''} - ${getSignDescription(venus.sign, 'Venus')}

Mars ${mars.sign} ${mars.degree.toFixed(1)}° - ${getSignDescription(mars.sign, 'Mars')}

**Growth & Structure**

Jupiter ${jupiter.sign} ${jupiter.degree.toFixed(1)}° - ${getSignDescription(jupiter.sign, 'Jupiter')}

Saturn ${saturn.sign} ${saturn.degree.toFixed(1)}° - ${getSignDescription(saturn.sign, 'Saturn')}

**Outer Planets**

Uranus ${uranus.sign}, Neptune ${neptune.sign}, Pluto ${pluto.sign} - Generational influences shaping innovation, spirituality, and transformation in your life.`;
}

function generateHouseSystemExplanation(reading: AstrologyReading): string {
  const { houses, ascendant, midheaven, planets } = reading;
  
  const ascendantSign = getSignFromLongitude(ascendant);
  const midheavenSign = getSignFromLongitude(midheaven);
  
  return `**House System Layout**

1st House (Self): ${ascendantSign} - Your identity and approach to life
10th House (Career): ${midheavenSign} - Your public role and reputation

**All House Cusps**
${houses.map(house => `${house.number}H ${house.name.split(' ')[2] || house.name.split(' ')[1]}: ${house.sign} ${house.degree.toFixed(1)}°`).join('\n')}

**Planetary House Placements**
${generatePlanetHouseInterpretations(reading)}

**Pattern Analysis**
${analyzeHousePatterns(reading)}

Houses show where your planetary energies manifest in daily life. The signs on each house cusp determine your approach to that life area.`;
}

function generateAspectsExplanation(reading: AstrologyReading): string {
  const { aspects } = reading;
  
  if (!aspects || aspects.length === 0) {
    return "Few major aspects. Planetary energies operate independently.";
  }

  // Categorize aspects by type and strength
  const tightAspects = aspects.filter(a => a.orb < 2);
  const beneficialAspects = aspects.filter(a => ['Trine', 'Sextile'].includes(a.aspect));
  const challengingAspects = aspects.filter(a => ['Square', 'Opposition'].includes(a.aspect));
  const conjunctions = aspects.filter(a => a.aspect === 'Conjunction');

  return `**Tight Aspects (Under 2°)**
${tightAspects.length > 0 ? 
    tightAspects.map(aspect => 
      `${aspect.planet1} ${getAspectSymbol(aspect.aspect)} ${aspect.planet2} (${aspect.orb.toFixed(1)}°) - ${getAspectDescription(aspect.aspect, aspect.planet1, aspect.planet2)}`
    ).join('\n')
    : 'None. Planetary energies operate with independence.'}

**Beneficial Aspects (Natural Talents)**
${beneficialAspects.length > 0 ? 
    beneficialAspects.slice(0, 5).map(aspect => 
      `${aspect.planet1} ${getAspectSymbol(aspect.aspect)} ${aspect.planet2} - ${getBeneficialAspectDescription(aspect.aspect, aspect.planet1, aspect.planet2)}`
    ).join('\n')
    : 'Few flowing aspects. Integration requires conscious effort.'}

**Dynamic Aspects (Growth Challenges)**
${challengingAspects.length > 0 ? 
    challengingAspects.slice(0, 5).map(aspect => 
      `${aspect.planet1} ${getAspectSymbol(aspect.aspect)} ${aspect.planet2} - ${getChallengingAspectDescription(aspect.aspect, aspect.planet1, aspect.planet2)}`
    ).join('\n')
    : 'Few challenging aspects. More harmonious but less driven.'}

**Conjunctions (Blended Energies)**
${conjunctions.length > 0 ? 
    conjunctions.map(aspect => 
      `${aspect.planet1} ☌ ${aspect.planet2} - ${getConjunctionDescription(aspect.planet1, aspect.planet2)}`
    ).join('\n')
    : 'No major conjunctions. Planetary energies remain distinct.'}

**Overall Pattern: ${getOverallAspectPattern(aspects).toUpperCase()}**
${getPatternDescription(getOverallAspectPattern(aspects))}`;
}

// Helper functions
function getSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(longitude / 30)];
}

function generatePlanetHouseInterpretations(reading: AstrologyReading): string {
  const { planets, houseCusps } = reading;
  
  const interpretations: string[] = [];
  
  planets.forEach(planet => {
    const houseNumber = calculateHousePosition(planet.longitude, houseCusps);
    const houseInterpretation = getPlanetInHouseInterpretation(planet.name, houseNumber);
    interpretations.push(`${planet.name} in ${houseNumber}H: ${houseInterpretation}`);
  });
  
  return interpretations.join('\n');
}

function getPlanetInHouseInterpretation(planetName: string, house: number): string {
  const interpretations: Record<string, Record<number, string>> = {
    'Sun': {
      1: 'Strong sense of self, natural leadership, identity-focused life path.',
      2: 'Values and self-worth central to identity, focus on resources and stability.',
      3: 'Communication and learning are key to self-expression, sibling relationships important.',
      4: 'Home and family central to identity, strong connection to roots and private life.',
      5: 'Creative self-expression vital, children and romance prominent life themes.',
      6: 'Daily work and health routines central to identity, service-oriented approach.',
      7: 'Partnerships crucial to self-discovery, identity developed through relationships.',
      8: 'Transformation and shared resources key, drawn to psychology and deep mysteries.',
      9: 'Higher learning and travel essential, philosophical and teaching nature.',
      10: 'Career and public recognition central, natural authority and reputation focus.',
      11: 'Friendships and group activities vital, humanitarian goals and social causes.',
      12: 'Spiritual development key, hidden talents, may work behind the scenes.'
    },
    'Moon': {
      1: 'Emotions strongly influence identity, intuitive and nurturing public presence.',
      2: 'Emotional security tied to material stability, comfort needs prominent.',
      3: 'Emotional communication, protective of siblings, mood affects thinking.',
      4: 'Strong family bonds, emotional foundation at home, protective instincts.',
      5: 'Emotional creativity, nurturing toward children, dramatic emotional expression.',
      6: 'Emotions affect daily routines, caring approach to work and health.',
      7: 'Emotional partnerships, seeking nurturing relationships, protective of partners.',
      8: 'Deep emotional transformations, psychic sensitivity, shared emotional resources.',
      9: 'Emotional connection to beliefs, intuitive learning, protective of ideals.',
      10: 'Public image tied to nurturing qualities, emotional approach to career.',
      11: 'Emotional friendships, protective of groups, maternal role in organizations.',
      12: 'Hidden emotional depths, spiritual sensitivity, subconscious emotional patterns.'
    },
    'Mercury': {
      1: 'Communication central to identity, quick-thinking, mentally active presence.',
      2: 'Practical thinking about resources, communication affects earning ability.',
      3: 'Natural communicator, strong sibling bonds, local community connections.',
      4: 'Family communication, thinking influenced by roots, intellectual home environment.',
      5: 'Creative communication, teaching children, playful intellectual expression.',
      6: 'Analytical approach to work, health communication, detailed daily thinking.',
      7: 'Partnership communication focus, thinking influenced by relationships.',
      8: 'Deep research abilities, transformative communication, psychological insights.',
      9: 'Higher learning focus, foreign connections, philosophical communication.',
      10: 'Professional communication, public speaking, reputation through intellect.',
      11: 'Group communication, friendship through shared ideas, social networking.',
      12: 'Intuitive thinking, hidden knowledge, subconscious communication patterns.'
    },
    'Venus': {
      1: 'Charm and beauty central to identity, attractive personality, artistic nature.',
      2: 'Values luxury and comfort, artistic talents may generate income.',
      3: 'Harmonious communication, beauty in local environment, artistic siblings.',
      4: 'Beautiful home important, family harmony valued, artistic domestic life.',
      5: 'Romance and creativity emphasized, love of entertainment and children.',
      6: 'Harmony in work environment, service through beauty, health through pleasure.',
      7: 'Partnership and marriage emphasized, harmony-seeking in relationships.',
      8: 'Intense attractions, shared aesthetic values, transformation through relationships.',
      9: 'Love of foreign cultures, philosophical approach to love, artistic beliefs.',
      10: 'Career in arts or beauty, public appreciation, harmonious reputation.',
      11: 'Friendship through shared aesthetics, social harmony, group creative projects.',
      12: 'Hidden artistic talents, spiritual love, compassionate service.'
    },
    'Mars': {
      1: 'Assertive identity, energetic presence, direct action, leadership qualities.',
      2: 'Energetic pursuit of resources, assertive about values, competitive earning.',
      3: 'Aggressive communication, sibling conflicts, energetic local activities.',
      4: 'Protective of family, energetic home life, potential domestic conflicts.',
      5: 'Competitive creativity, passionate romance, energetic with children.',
      6: 'Energetic work approach, health through activity, potential workplace conflicts.',
      7: 'Assertive in partnerships, may attract conflict, needs independent partner.',
      8: 'Intense transformations, sexual energy prominent, aggressive about shared resources.',
      9: 'Passionate beliefs, energetic about higher learning, may fight for ideals.',
      10: 'Ambitious career drive, competitive reputation, leadership in public life.',
      11: 'Energetic friendships, group leadership, fighting for social causes.',
      12: 'Hidden anger patterns, spiritual warrior, behind-the-scenes action.'
    },
    'Jupiter': {
      1: 'Optimistic identity, expansive presence, natural teaching ability, lucky.',
      2: 'Generous with resources, optimistic about money, expansive value system.',
      3: 'Expansive communication, philosophical siblings, broad local connections.',
      4: 'Large family influence, optimistic home life, expansive domestic situation.',
      5: 'Creative abundance, generous with children, expansive romantic approach.',
      6: 'Optimistic work approach, health through expansion, generous service.',
      7: 'Expansive partnerships, optimistic about relationships, may attract teachers.',
      8: 'Transformational growth, optimistic about change, expansive shared resources.',
      9: 'Natural higher learning, foreign travel likely, expansive belief system.',
      10: 'Career growth potential, optimistic reputation, teaching or counseling career.',
      11: 'Expansive friendships, optimistic group involvement, humanitarian leadership.',
      12: 'Spiritual growth, hidden wisdom, compassionate service, intuitive expansion.'
    },
    'Saturn': {
      1: 'Serious identity, mature presence, late bloomer, disciplined self-development.',
      2: 'Cautious with resources, delayed financial success, conservative values.',
      3: 'Structured communication, serious siblings, disciplined learning approach.',
      4: 'Serious family responsibilities, structured home, potential family restrictions.',
      5: 'Disciplined creativity, serious about children, structured approach to romance.',
      6: 'Structured work routine, health disciplines, serious service orientation.',
      7: 'Serious partnerships, committed relationships, mature partner attraction.',
      8: 'Deep transformational work, serious about shared resources, psychological discipline.',
      9: 'Structured beliefs, serious higher learning, disciplined philosophical approach.',
      10: 'Ambitious career focus, serious reputation building, authority development.',
      11: 'Serious friendships, structured group involvement, disciplined social goals.',
      12: 'Spiritual discipline, hidden restrictions, serious inner work required.'
    }
  };
  
  return interpretations[planetName]?.[house] || `${planetName} brings its energy to ${house}H themes.`;
}

function getSignDescription(sign: string, planet: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Sun': {
      'Aries': 'Leadership, courage, pioneering.',
      'Taurus': 'Stability, beauty, practical building.',
      'Gemini': 'Communication, learning, connecting ideas.',
      'Cancer': 'Nurturing, protection, emotional wisdom.',
      'Leo': 'Creative self-expression, performance.',
      'Virgo': 'Service, healing, perfecting craft.',
      'Libra': 'Harmony, balance, diplomatic beauty.',
      'Scorpio': 'Transformation, depth, life mysteries.',
      'Sagittarius': 'Teaching, exploration, expanding horizons.',
      'Capricorn': 'Structure, achievement, mastery.',
      'Aquarius': 'Innovation, liberation, humanitarian service.',
      'Pisces': 'Spiritual bridging, healing, inspiration.'
    },
    'Moon': {
      'Aries': 'Security through action and leadership.',
      'Taurus': 'Security through stability and comfort.',
      'Gemini': 'Security through mental stimulation.',
      'Cancer': 'Security through nurturing connection.',
      'Leo': 'Security through creative appreciation.',
      'Virgo': 'Security through order and service.',
      'Libra': 'Security through balanced relationships.',
      'Scorpio': 'Security through emotional depth.',
      'Sagittarius': 'Security through adventure and wisdom.',
      'Capricorn': 'Security through structure and achievement.',
      'Aquarius': 'Security through friendship and ideals.',
      'Pisces': 'Security through spiritual compassion.'
    },
    'Mercury': {
      'Aries': 'Quick, direct thinking and communication.',
      'Taurus': 'Practical, steady thinking and communication.',
      'Gemini': 'Versatile, brilliant communication.',
      'Cancer': 'Emotional, intuitive communication.',
      'Leo': 'Creative, dramatic communication.',
      'Virgo': 'Analytical, precise communication.',
      'Libra': 'Diplomatic, harmonious communication.',
      'Scorpio': 'Deep, intense communication.',
      'Sagittarius': 'Philosophical, expansive communication.',
      'Capricorn': 'Strategic, authoritative communication.',
      'Aquarius': 'Innovative, unique communication.',
      'Pisces': 'Intuitive, poetic communication.'
    },
    'Venus': {
      'Aries': 'Bold love, attracted to excitement.',
      'Taurus': 'Steady love, attracted to beauty.',
      'Gemini': 'Varied love, attracted to intelligence.',
      'Cancer': 'Deep love, attracted to caring.',
      'Leo': 'Dramatic love, attracted to creativity.',
      'Virgo': 'Practical love, attracted to competence.',
      'Libra': 'Harmonious love, attracted to balance.',
      'Scorpio': 'Intense love, attracted to depth.',
      'Sagittarius': 'Adventurous love, attracted to freedom.',
      'Capricorn': 'Traditional love, attracted to stability.',
      'Aquarius': 'Unique love, attracted to ideals.',
      'Pisces': 'Compassionate love, attracted to spirituality.'
    },
    'Mars': {
      'Aries': 'Direct, courageous action.',
      'Taurus': 'Patient, determined action.',
      'Gemini': 'Versatile, adaptable action.',
      'Cancer': 'Intuitive, protective action.',
      'Leo': 'Confident, creative action.',
      'Virgo': 'Precise, skillful action.',
      'Libra': 'Diplomatic, cooperative action.',
      'Scorpio': 'Intense, transformative action.',
      'Sagittarius': 'Enthusiastic, philosophical action.',
      'Capricorn': 'Strategic, ambitious action.',
      'Aquarius': 'Innovative, rebellious action.',
      'Pisces': 'Intuitive, compassionate action.'
    },
    'Jupiter': {
      'Aries': 'Growth through leadership and adventure.',
      'Taurus': 'Growth through resources and beauty.',
      'Gemini': 'Growth through learning and teaching.',
      'Cancer': 'Growth through family and nurturing.',
      'Leo': 'Growth through creative expression.',
      'Virgo': 'Growth through service and skills.',
      'Libra': 'Growth through relationships and art.',
      'Scorpio': 'Growth through transformation and research.',
      'Sagittarius': 'Growth through philosophy and travel.',
      'Capricorn': 'Growth through achievement and structure.',
      'Aquarius': 'Growth through innovation and causes.',
      'Pisces': 'Growth through spirituality and art.'
    },
    'Saturn': {
      'Aries': 'Discipline through patience and strategy.',
      'Taurus': 'Discipline through lasting foundations.',
      'Gemini': 'Discipline through structured learning.',
      'Cancer': 'Discipline through emotional maturity.',
      'Leo': 'Discipline through authentic expression.',
      'Virgo': 'Discipline through skill perfection.',
      'Libra': 'Discipline through balanced judgment.',
      'Scorpio': 'Discipline through emotional control.',
      'Sagittarius': 'Discipline through focused wisdom.',
      'Capricorn': 'Discipline through ambitious achievement.',
      'Aquarius': 'Discipline through structured innovation.',
      'Pisces': 'Discipline through spiritual practice.'
    }
  };
  
  return descriptions[planet]?.[sign] || `${sign} energy in ${planet}.`;
}

function analyzeHousePatterns(reading: AstrologyReading): string {
  // Analyze which houses have planets and identify patterns
  const planetCounts: Record<number, number> = {};
  
  reading.planets.forEach(planet => {
    // Calculate which house each planet is in based on house cusps
    const planetHouse = calculateHousePosition(planet.longitude, reading.houseCusps);
    planetCounts[planetHouse] = (planetCounts[planetHouse] || 0) + 1;
  });
  
  const emphasizedHouses = Object.entries(planetCounts)
    .filter(([_, count]) => count >= 2)
    .map(([house, count]) => ({ house: parseInt(house), count }));
    
  if (emphasizedHouses.length === 0) {
    return "Your planets are evenly distributed across your houses, suggesting a well-rounded life experience with attention to many different areas.";
  }
  
  const houseNames = [
    '', '1st (Self)', '2nd (Resources)', '3rd (Communication)', '4th (Home)', 
    '5th (Creativity)', '6th (Service)', '7th (Partnership)', '8th (Transformation)', 
    '9th (Philosophy)', '10th (Career)', '11th (Community)', '12th (Spirituality)'
  ];
  
  return `Your chart shows emphasis in the ${emphasizedHouses.map(h => `${houseNames[h.house]} house (${h.count} planets)`).join(', ')}, suggesting these life areas will be particularly important themes for you.`;
}

function calculateHousePosition(longitude: number, houseCusps: number[]): number {
  for (let i = 0; i < houseCusps.length; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % houseCusps.length];
    
    if (nextCusp > currentCusp) {
      if (longitude >= currentCusp && longitude < nextCusp) {
        return i + 1;
      }
    } else {
      // Handle wrap-around case (e.g., 11th to 12th house)
      if (longitude >= currentCusp || longitude < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1; // Default to 1st house
}

function getAspectSymbol(aspect: string): string {
  const symbols: Record<string, string> = {
    'Conjunction': '☌',
    'Opposition': '☍', 
    'Trine': '△',
    'Square': '□',
    'Sextile': '⚹',
    'Quincunx': '⚻'
  };
  return symbols[aspect] || '○';
}

function getAspectDescription(aspect: string, planet1: string, planet2: string): string {
  return `${getDetailedAspectInterpretation(aspect, planet1, planet2)}`;
}

function getBeneficialAspectDescription(aspect: string, planet1: string, planet2: string): string {
  return `${getDetailedAspectInterpretation(aspect, planet1, planet2)}`;
}

function getChallengingAspectDescription(aspect: string, planet1: string, planet2: string): string {
  return `${getDetailedAspectInterpretation(aspect, planet1, planet2)}`;
}

function getConjunctionDescription(planet1: string, planet2: string): string {
  return `${getDetailedAspectInterpretation('Conjunction', planet1, planet2)}`;
}

function getDetailedAspectInterpretation(aspect: string, planet1: string, planet2: string): string {
  const key = `${planet1}-${planet2}` in aspectInterpretations ? `${planet1}-${planet2}` : `${planet2}-${planet1}`;
  const interpretation = aspectInterpretations[key]?.[aspect];
  
  if (interpretation) {
    return interpretation;
  }
  
  // Fallback to general interpretation
  const nature = getAspectNature(aspect);
  return `${nature.charAt(0).toUpperCase() + nature.slice(1)} energy between ${planet1.toLowerCase()} and ${planet2.toLowerCase()}. ${getGeneralAspectMeaning(aspect)}`;
}

function getGeneralAspectMeaning(aspect: string): string {
  const meanings: Record<string, string> = {
    'Conjunction': 'These energies blend and amplify each other.',
    'Opposition': 'These energies seek balance through conscious integration.',
    'Trine': 'Natural talent and easy flow between these areas.',
    'Square': 'Dynamic tension that drives growth and achievement.',
    'Sextile': 'Opportunities for cooperation and skill development.',
    'Quincunx': 'Requires adjustment and conscious effort to integrate.'
  };
  return meanings[aspect] || 'These energies interact in unique ways.';
}

const aspectInterpretations: Record<string, Record<string, string>> = {
  'Sun-Moon': {
    'Conjunction': 'Unified conscious and unconscious selves. Emotions and identity work as one, creating inner harmony but potential blind spots.',
    'Opposition': 'Tension between conscious goals and emotional needs. Must learn to balance public image with private feelings.',
    'Trine': 'Natural ease between ego and emotions. Confident expression of feelings, leadership through emotional intelligence.',
    'Square': 'Internal conflict between what you want and what you need. Growth through integrating willpower with emotional wisdom.',
    'Sextile': 'Opportunities to align identity with emotional truth. Creative self-expression through emotional awareness.'
  },
  'Sun-Mercury': {
    'Conjunction': 'Mind and identity closely linked. Strong self-expression through communication, but may struggle with objectivity.',
    'Opposition': 'Tension between ego and rational thought. Must balance self-expression with listening to others.',
    'Trine': 'Natural ease between identity and communication. Confident speaking and writing abilities.',
    'Square': 'Mental restlessness drives growth. May struggle with pride in ideas but develops strong communication skills.',
    'Sextile': 'Opportunities for intellectual self-expression. Good at explaining personal vision to others.'
  },
  'Sun-Venus': {
    'Conjunction': 'Charm and creativity central to identity. Natural artistic ability, but may prioritize being liked over authenticity.',
    'Opposition': 'Tension between self-expression and harmony. Must balance personal needs with relationship dynamics.',
    'Trine': 'Natural artistic and social gifts. Easy expression of beauty and charm in life.',
    'Square': 'Creative tension drives artistic growth. May struggle with vanity but develops refined aesthetic sense.',
    'Sextile': 'Opportunities for creative self-expression. Social skills enhance personal goals.'
  },
  'Sun-Mars': {
    'Conjunction': 'Powerful drive and assertion. High energy and leadership, but may be impatient or aggressive.',
    'Opposition': 'Tension between ego and action. Must learn when to assert versus when to yield.',
    'Trine': 'Natural courage and leadership ability. Confident action aligned with personal goals.',
    'Square': 'Dynamic tension fuels achievement. May struggle with anger but develops strong willpower.',
    'Sextile': 'Opportunities for confident action. Good at initiating projects that reflect personal vision.'
  },
  'Moon-Mercury': {
    'Conjunction': 'Emotions and thoughts closely linked. Intuitive communication, but may be subjective in thinking.',
    'Opposition': 'Tension between feelings and logic. Must balance emotional responses with rational analysis.',
    'Trine': 'Natural emotional intelligence. Easy expression of feelings through communication.',
    'Square': 'Emotional restlessness drives mental growth. May overthink feelings but develops psychological insight.',
    'Sextile': 'Opportunities for emotional communication. Good at expressing feelings clearly.'
  },
  'Moon-Venus': {
    'Conjunction': 'Emotional harmony and artistic sensitivity. Natural grace, but may avoid conflict.',
    'Opposition': 'Tension between emotional needs and social harmony. Must balance caring with boundaries.',
    'Trine': 'Natural emotional charm and artistic ability. Easy expression of love and beauty.',
    'Square': 'Emotional desires create growth through relationship challenges. Learns to balance giving and receiving.',
    'Sextile': 'Opportunities for emotional creativity. Social skills support emotional needs.'
  },
  'Mercury-Venus': {
    'Conjunction': 'Beautiful communication and artistic thinking. Natural charm in speech, diplomatic abilities.',
    'Opposition': 'Tension between logic and aesthetics. Must balance practical thinking with social harmony.',
    'Trine': 'Natural verbal and artistic talents. Easy expression of ideas in beautiful ways.',
    'Square': 'Creative tension in communication. May struggle with being too agreeable but develops refined expression.',
    'Sextile': 'Opportunities for artistic communication. Social connections support intellectual goals.'
  },
  'Jupiter-Saturn': {
    'Conjunction': 'Balance between expansion and limitation. Realistic optimism, builds lasting growth.',
    'Opposition': 'Tension between growth and restriction. Must balance opportunity with responsibility.',
    'Trine': 'Natural wisdom and practical growth. Patient expansion with solid foundations.',
    'Square': 'Growth through overcoming limitations. May struggle with timing but develops sustainable success.',
    'Sextile': 'Opportunities for structured growth. Good at building realistic long-term plans.'
  },
  'Uranus-Pluto': {
    'Conjunction': 'Revolutionary transformation abilities. Generational influence toward radical change.',
    'Opposition': 'Tension between innovation and deep transformation. Must balance progress with profound change.',
    'Trine': 'Natural ability to transform through innovation. Easy integration of change and progress.',
    'Square': 'Dynamic tension drives societal change. Part of generational challenges and breakthroughs.',
    'Sextile': 'Opportunities for evolutionary change. Good at combining innovation with transformation.'
  }
};

function getAspectNature(aspect: string): string {
  const natures: Record<string, string> = {
    'Conjunction': 'unified',
    'Opposition': 'polarizing', 
    'Trine': 'harmonious',
    'Square': 'dynamic',
    'Sextile': 'supportive',
    'Quincunx': 'adjusting'
  };
  return natures[aspect] || 'complex';
}

function getOverallAspectPattern(aspects: any[]): string {
  const total = aspects.length;
  const beneficial = aspects.filter(a => ['Trine', 'Sextile'].includes(a.aspect)).length;
  const challenging = aspects.filter(a => ['Square', 'Opposition'].includes(a.aspect)).length;
  
  if (beneficial > challenging * 1.5) return 'flowing';
  if (challenging > beneficial * 1.5) return 'dynamic';
  return 'balanced';
}

function getPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    'flowing': 'you have natural talents and easy energy flow, but may need to push yourself to achieve your full potential',
    'dynamic': 'you have inner tensions that drive achievement and growth, requiring conscious work to integrate different parts of yourself',
    'balanced': 'you have a good mix of natural talents and growth challenges, creating a balanced but complex personality'
  };
  return descriptions[pattern] || 'you have a unique blend of energies';
}