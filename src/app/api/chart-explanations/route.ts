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

  // 4. Element Balance Explanation
  const elementExplanation = generateElementBalanceExplanation(reading);
  explanations.push({
    id: 'element-balance',
    title: 'Your Elemental Temperament',
    content: elementExplanation
  });

  // 5. Modal Balance Explanation
  const modalExplanation = generateModalBalanceExplanation(reading);
  explanations.push({
    id: 'modal-balance',
    title: 'Your Action Patterns',
    content: modalExplanation
  });

  // 6. Dispositor Chart Explanation
  const dispositorExplanation = generateDispositorChartExplanation(reading);
  explanations.push({
    id: 'dispositor-chart',
    title: 'Your Power Structure',
    content: dispositorExplanation
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
    },
    'Uranus': {
      1: 'Unique identity, rebellious nature, innovative self-expression, sudden life changes.',
      2: 'Unconventional approach to resources, sudden financial changes, innovative earning.',
      3: 'Original thinking, unusual siblings, breakthrough communication methods.',
      4: 'Unusual family background, innovative home life, sudden domestic changes.',
      5: 'Creative originality, unconventional romance, unique approach to children.',
      6: 'Innovative work methods, unusual health approaches, revolutionary service.',
      7: 'Unusual partnerships, need for freedom in relationships, sudden relationship changes.',
      8: 'Sudden transformations, innovative approach to shared resources, revolutionary psychology.',
      9: 'Original beliefs, unusual higher learning, innovative philosophical approaches.',
      10: 'Unconventional career, sudden reputation changes, innovative public role.',
      11: 'Unusual friendships, revolutionary group involvement, humanitarian innovation.',
      12: 'Spiritual breakthroughs, hidden innovations, sudden spiritual awakenings.'
    },
    'Neptune': {
      1: 'Dreamy identity, compassionate presence, potential identity confusion, spiritual sensitivity.',
      2: 'Idealistic about resources, potential financial confusion, compassionate values.',
      3: 'Intuitive communication, sensitive siblings, poetic or confused thinking.',
      4: 'Idealized family, compassionate home life, potential family illusions.',
      5: 'Romantic idealism, creative inspiration, compassionate with children.',
      6: 'Service through compassion, potential work confusion, healing-oriented service.',
      7: 'Idealized partnerships, compassionate relationships, potential relationship illusions.',
      8: 'Spiritual transformation, intuitive shared resources, mystical psychology.',
      9: 'Spiritual beliefs, idealistic higher learning, mystical or confused philosophy.',
      10: 'Compassionate career, idealized reputation, potential career confusion.',
      11: 'Idealistic friendships, compassionate group involvement, spiritual social goals.',
      12: 'Strong spiritual connection, mystical experiences, compassionate service.'
    },
    'Pluto': {
      1: 'Intense identity, transformative presence, powerful personality, potential control issues.',
      2: 'Intense relationship with resources, transformative earning, power through possessions.',
      3: 'Deep thinking, intense siblings, transformative communication methods.',
      4: 'Powerful family dynamics, transformative home life, deep family secrets.',
      5: 'Intense creativity, transformative romance, powerful influence on children.',
      6: 'Transformative work, intense service orientation, healing through crisis.',
      7: 'Intense partnerships, transformative relationships, power dynamics in marriage.',
      8: 'Natural transformation abilities, intense shared resources, psychological power.',
      9: 'Transformative beliefs, intense higher learning, powerful philosophical convictions.',
      10: 'Powerful career influence, transformative public role, intense reputation.',
      11: 'Transformative friendships, powerful group influence, revolutionary social goals.',
      12: 'Deep spiritual transformation, hidden power, psychological healing abilities.'
    },
    'North Node': {
      1: 'Soul growth through developing independent identity, leadership lessons, self-reliance.',
      2: 'Soul growth through developing personal values, resource management, self-worth lessons.',
      3: 'Soul growth through communication skills, local connections, sibling relationships.',
      4: 'Soul growth through family responsibilities, home building, emotional foundation.',
      5: 'Soul growth through creative expression, child relationships, heart-centered living.',
      6: 'Soul growth through service, daily routines, health consciousness, humble work.',
      7: 'Soul growth through partnerships, cooperation, relationship balance, considering others.',
      8: 'Soul growth through transformation, shared resources, psychological depth, crisis wisdom.',
      9: 'Soul growth through higher learning, travel, teaching, philosophical expansion.',
      10: 'Soul growth through career achievement, public responsibility, authority development.',
      11: 'Soul growth through group participation, friendship, humanitarian goals, social consciousness.',
      12: 'Soul growth through spiritual service, compassion, releasing ego, mystical understanding.'
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
  },
  'Sun-Jupiter': {
    'Conjunction': 'Expansive identity and natural optimism. Generous spirit but may overextend or be overconfident.',
    'Opposition': 'Tension between ego and higher wisdom. Must balance personal goals with broader perspective.',
    'Trine': 'Natural confidence and good fortune. Easy success through optimistic leadership.',
    'Square': 'Overconfidence drives growth through challenges. Learns wisdom through excessive risks.',
    'Sextile': 'Opportunities for growth through confident expression. Good at inspiring others.'
  },
  'Sun-Saturn': {
    'Conjunction': 'Serious identity with strong discipline. Natural authority but may be overly critical of self.',
    'Opposition': 'Tension between self-expression and limitations. Must balance creativity with responsibility.',
    'Trine': 'Natural ability to build lasting achievements. Disciplined success and mature leadership.',
    'Square': 'Growth through overcoming restrictions. Develops strength through facing obstacles.',
    'Sextile': 'Opportunities for structured success. Good at building solid foundations for goals.'
  },
  'Sun-Uranus': {
    'Conjunction': 'Unique identity and rebellious spirit. Original self-expression but may be unpredictable.',
    'Opposition': 'Tension between ego and innovation. Must balance personal expression with group needs.',
    'Trine': 'Natural originality and leadership in change. Easy expression of unique qualities.',
    'Square': 'Revolutionary spirit drives growth through disruption. Learns leadership through rebellion.',
    'Sextile': 'Opportunities for innovative self-expression. Good at leading progressive changes.'
  },
  'Sun-Neptune': {
    'Conjunction': 'Spiritual identity with compassionate nature. Creative inspiration but potential self-deception.',
    'Opposition': 'Tension between ego and spirituality. Must balance personal goals with universal service.',
    'Trine': 'Natural spiritual leadership and artistic ability. Easy expression of compassion and creativity.',
    'Square': 'Spiritual confusion drives growth toward clarity. Learns authenticity through illusion.',
    'Sextile': 'Opportunities for inspired leadership. Good at expressing vision through creative means.'
  },
  'Sun-Pluto': {
    'Conjunction': 'Intense identity with transformative power. Natural leadership through crisis but may be controlling.',
    'Opposition': 'Tension between ego and transformation. Must balance personal power with regeneration.',
    'Trine': 'Natural ability to lead through change. Easy expression of personal power and transformation.',
    'Square': 'Power struggles drive growth through transformation. Learns authentic leadership through crisis.',
    'Sextile': 'Opportunities for transformative leadership. Good at empowering others through change.'
  },
  'Moon-Mars': {
    'Conjunction': 'Emotional intensity and protective instincts. Quick emotional reactions, passionate nurturing.',
    'Opposition': 'Tension between feelings and action. Must balance emotional needs with assertive expression.',
    'Trine': 'Natural emotional courage and protective strength. Easy expression of passionate caring.',
    'Square': 'Emotional frustration drives growth through action. Learns patience through reactive patterns.',
    'Sextile': 'Opportunities for emotional assertiveness. Good at protective action and passionate expression.'
  },
  'Moon-Jupiter': {
    'Conjunction': 'Emotional optimism and generous nurturing. Expansive feelings but may be overly indulgent.',
    'Opposition': 'Tension between emotional needs and philosophical beliefs. Must balance caring with wisdom.',
    'Trine': 'Natural emotional wisdom and generous caring. Easy expression of optimistic nurturing.',
    'Square': 'Emotional excess drives growth through wisdom. Learns boundaries through overgiving.',
    'Sextile': 'Opportunities for wise nurturing. Good at emotional teaching and generous support.'
  },
  'Moon-Saturn': {
    'Conjunction': 'Serious emotional nature with mature nurturing. Responsible feelings but may suppress emotions.',
    'Opposition': 'Tension between emotional needs and discipline. Must balance feeling with structure.',
    'Trine': 'Natural emotional maturity and steady nurturing. Easy expression of responsible caring.',
    'Square': 'Emotional restrictions drive growth through patience. Learns security through facing fears.',
    'Sextile': 'Opportunities for structured emotional support. Good at providing stable, mature guidance.'
  },
  'Venus-Mars': {
    'Conjunction': 'Passionate love nature with attractive magnetism. Strong desires but may be impulsive in love.',
    'Opposition': 'Tension between love and desire. Must balance harmony with passion in relationships.',
    'Trine': 'Natural charm and passionate attraction. Easy expression of love and desire in harmony.',
    'Square': 'Relationship tensions drive growth through balance. Learns cooperation through romantic challenges.',
    'Sextile': 'Opportunities for balanced relationships. Good at combining love with healthy assertion.'
  },
  'Venus-Jupiter': {
    'Conjunction': 'Generous love nature with artistic expansion. Beautiful abundance but may be excessive in pleasure.',
    'Opposition': 'Tension between personal love and universal compassion. Must balance intimacy with broader service.',
    'Trine': 'Natural artistic gifts and generous love. Easy expression of beauty and expanded affection.',
    'Square': 'Excessive desires drive growth through moderation. Learns balance through indulgence.',
    'Sextile': 'Opportunities for beautiful expansion. Good at creating abundance through loving relationships.'
  },
  'Mars-Jupiter': {
    'Conjunction': 'Enthusiastic action with expansive energy. Bold adventures but may be overconfident or wasteful.',
    'Opposition': 'Tension between action and philosophy. Must balance doing with understanding broader meaning.',
    'Trine': 'Natural leadership and confident action. Easy expression of enthusiastic achievement.',
    'Square': 'Overextension drives growth through realistic planning. Learns wisdom through excessive action.',
    'Sextile': 'Opportunities for wise action. Good at taking confident steps toward meaningful goals.'
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

function generateElementBalanceExplanation(reading: AstrologyReading): string {
  // Extract element data from chartDescription
  const chartData = reading.chartDescription || '';
  const elementMatch = chartData.match(/\[ELEMENT DISTRIBUTION\]\n(.+)/);
  
  if (!elementMatch) {
    return 'Element distribution data not available for detailed analysis.';
  }

  const elementData = elementMatch[1];
  const elements = parseElementData(elementData);
  
  const { dominant, lacking, balanced } = analyzeElementBalance(elements);
  
  return `${formatElementCounts(elements)}

**Dominant Element: ${dominant.name.toUpperCase()}**
${getElementDominantDescription(dominant.name, dominant.count)} ${getElementManifestation(dominant.name)}

**Balancing Need: ${lacking.name.toUpperCase()}**
${getElementLackingDescription(lacking.name, lacking.count)} ${getElementCompensation(lacking.name)}

**Element Integration**
${generateElementIntegrationAdvice(elements)}

**How This Shapes You**
${getOverallElementalPersonality(dominant.name, lacking.name)}`;
}

function generateModalBalanceExplanation(reading: AstrologyReading): string {
  // Extract modality data from chartDescription  
  const chartData = reading.chartDescription || '';
  const modalityMatch = chartData.match(/\[MODALITY DISTRIBUTION\]\n(.+)/);
  
  if (!modalityMatch) {
    return 'Modality distribution data not available for detailed analysis.';
  }

  const modalityData = modalityMatch[1];
  const modalities = parseModalityData(modalityData);
  
  const { dominant, lacking, balanced } = analyzeModalityBalance(modalities);
  
  return `${formatModalityCounts(modalities)}

**Primary Mode: ${dominant.name.toUpperCase()}**
${getModalityDominantDescription(dominant.name, dominant.count)} ${getModalityManifestation(dominant.name)}

**Growth Area: ${lacking.name.toUpperCase()}**
${getModalityLackingDescription(lacking.name, lacking.count)} ${getModalityDevelopment(lacking.name)}

**Modal Integration**
${generateModalityIntegrationAdvice(modalities)}

**Life Approach Pattern**
${getOverallModalityPersonality(dominant.name, lacking.name)}`;
}

function generateDispositorChartExplanation(reading: AstrologyReading): string {
  // Extract dispositor data from chartDescription
  const chartData = reading.chartDescription || '';
  const dispositorMatch = chartData.match(/\[DISPOSITOR TREE\]\n((?:.|\n)*?)(?=\[|$)/);
  
  if (!dispositorMatch) {
    return 'Dispositor tree data not available for detailed analysis.';
  }

  const dispositorData = dispositorMatch[1].trim();
  
  // Simple analysis based on the raw data
  const hasCycles = dispositorData.includes('(cycle)');
  const hasFinals = dispositorData.includes('(final)');
  
  return `${dispositorData}

**Power Structure Analysis**
${hasCycles && hasFinals ? 
  'Mixed authority structure with both final dispositors and mutual reception cycles. Some planets flow to ultimate authorities while others support each other in cooperative cycles.' :
  hasCycles ? 
  'Mutual reception dominant structure. Most planetary energies support each other in cooperative cycles rather than flowing to single authorities.' :
  hasFinals ?
  'Hierarchical structure with clear final dispositors. Planetary energies flow to ultimate governing planets that organize your psychological functions.' :
  'Complex distributed authority with no clear final dispositors or major cycles.'}

**Integration Strategy**
${hasCycles ? 
  'Focus on developing the cooperative relationships between planets in cycles. These mutual support systems are your greatest strength - cultivate the balance between these planetary functions.' :
  'Work on strengthening your final dispositor planets as they organize all other energies. These governing planets are key to your psychological integration and life effectiveness.'}`; 
}

// Helper functions for element analysis
function parseElementData(elementData: string): Record<string, number> {
  const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  
  elementData.split('|').forEach(part => {
    const match = part.trim().match(/(\w+):\s*(\d+)/);
    if (match) {
      elements[match[1]] = parseInt(match[2]);
    }
  });
  
  return elements;
}

function analyzeElementBalance(elements: Record<string, number>) {
  const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  return {
    dominant: { name: sorted[0][0], count: sorted[0][1] },
    lacking: { name: sorted[3][0], count: sorted[3][1] },
    balanced: sorted[1][1] === sorted[2][1]
  };
}

function formatElementCounts(elements: Record<string, number>): string {
  return Object.entries(elements)
    .map(([element, count]) => `${element}: ${count} planets`)
    .join(' | ');
}

function getElementDominantDescription(element: string, count: number): string {
  const descriptions: Record<string, string> = {
    Fire: `With ${count} planets in Fire signs, you operate with high energy, enthusiasm, and direct action.`,
    Earth: `With ${count} planets in Earth signs, you prioritize practical results, stability, and tangible achievements.`,
    Air: `With ${count} planets in Air signs, you process life through ideas, communication, and mental connections.`,
    Water: `With ${count} planets in Water signs, you navigate through emotions, intuition, and psychic sensitivity.`
  };
  return descriptions[element] || `Strong ${element} emphasis shapes your core nature.`;
}

function getElementManifestation(element: string): string {
  const manifestations: Record<string, string> = {
    Fire: 'You start projects easily, inspire others, and prefer quick results over lengthy planning.',
    Earth: 'You build lasting foundations, value security, and prefer proven methods over untested ideas.',
    Air: 'You need mental stimulation, communicate naturally, and prefer understanding before committing.',
    Water: 'You trust your feelings, respond to emotional undercurrents, and prefer harmony over conflict.'
  };
  return manifestations[element] || '';
}

function getElementLackingDescription(element: string, count: number): string {
  const descriptions: Record<string, string> = {
    Fire: `With only ${count} planets in Fire, you may struggle with initiative, confidence, or sustained enthusiasm.`,
    Earth: `With only ${count} planets in Earth, you may lack practical follow-through or struggle with material security.`,
    Air: `With only ${count} planets in Air, you may have difficulty with objective thinking or clear communication.`,
    Water: `With only ${count} planets in Water, you may disconnect from emotions or lack intuitive sensitivity.`
  };
  return descriptions[element] || `Limited ${element} energy requires conscious development.`;
}

function getElementCompensation(element: string): string {
  const compensations: Record<string, string> = {
    Fire: 'Develop confidence through small wins, exercise regularly, and practice decisive action.',
    Earth: 'Create structured routines, focus on practical skills, and build material stability step-by-step.',
    Air: 'Practice active listening, study diverse subjects, and engage in regular intellectual exchange.',
    Water: 'Develop emotional vocabulary, practice meditation, and honor your intuitive responses.'
  };
  return compensations[element] || '';
}

function generateElementIntegrationAdvice(elements: Record<string, number>): string {
  const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
  const balanced = Object.values(elements).every(count => Math.abs(count - total/4) <= 1);
  
  if (balanced) {
    return 'Your elements are well-balanced, giving you access to all four modes of processing life experiences.';
  }
  
  const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  return `Focus on developing your ${sorted[3][0]} qualities to balance your strong ${sorted[0][0]} nature.`;
}

function getOverallElementalPersonality(dominant: string, lacking: string): string {
  const combinations: Record<string, Record<string, string>> = {
    Fire: {
      Earth: 'Your fiery enthusiasm needs grounding in practical reality and patient follow-through.',
      Air: 'Your direct action style needs balance with thoughtful planning and communication.',
      Water: 'Your confident energy needs softening with emotional sensitivity and intuitive awareness.'
    },
    Earth: {
      Fire: 'Your practical nature needs energizing with spontaneous action and confident initiative.',
      Air: 'Your grounded approach needs expanding with intellectual curiosity and social connection.',
      Water: 'Your material focus needs deepening with emotional awareness and intuitive trust.'
    },
    Air: {
      Fire: 'Your mental approach needs energizing with direct action and confident decision-making.',
      Earth: 'Your theoretical nature needs grounding in practical application and concrete results.',
      Water: 'Your logical mind needs balancing with emotional intelligence and intuitive wisdom.'
    },
    Water: {
      Fire: 'Your emotional depth needs energizing with confident action and enthusiastic expression.',
      Earth: 'Your intuitive nature needs grounding in practical skills and material security.',
      Air: 'Your feeling-based decisions need balancing with objective analysis and clear communication.'
    }
  };
  
  return combinations[dominant]?.[lacking] || 'Your elemental mix creates a unique approach to life experiences.';
}

// Helper functions for modality analysis
function parseModalityData(modalityData: string): Record<string, number> {
  const modalities: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  
  modalityData.split('|').forEach(part => {
    const match = part.trim().match(/(\w+):\s*(\d+)/);
    if (match) {
      modalities[match[1]] = parseInt(match[2]);
    }
  });
  
  return modalities;
}

function analyzeModalityBalance(modalities: Record<string, number>) {
  const sorted = Object.entries(modalities).sort((a, b) => b[1] - a[1]);
  return {
    dominant: { name: sorted[0][0], count: sorted[0][1] },
    lacking: { name: sorted[2][0], count: sorted[2][1] },
    balanced: sorted[0][1] === sorted[1][1]
  };
}

function formatModalityCounts(modalities: Record<string, number>): string {
  return Object.entries(modalities)
    .map(([modality, count]) => `${modality}: ${count} planets`)
    .join(' | ');
}

function getModalityDominantDescription(modality: string, count: number): string {
  const descriptions: Record<string, string> = {
    Cardinal: `With ${count} planets in Cardinal signs, you initiate action, lead change, and start new phases naturally.`,
    Fixed: `With ${count} planets in Fixed signs, you sustain effort, resist change, and build lasting stability.`,
    Mutable: `With ${count} planets in Mutable signs, you adapt easily, process information, and facilitate transitions.`
  };
  return descriptions[modality] || `Strong ${modality} emphasis shapes your action style.`;
}

function getModalityManifestation(modality: string): string {
  const manifestations: Record<string, string> = {
    Cardinal: 'You prefer to be in charge, dislike stagnation, and energize situations through decisive action.',
    Fixed: 'You prefer consistency, resist pressure to change, and provide stability through determined persistence.',
    Mutable: 'You prefer flexibility, dislike rigid structure, and contribute through adaptive problem-solving.'
  };
  return manifestations[modality] || '';
}

function getModalityLackingDescription(modality: string, count: number): string {
  const descriptions: Record<string, string> = {
    Cardinal: `With only ${count} planets in Cardinal signs, you may struggle with initiative, leadership, or starting projects.`,
    Fixed: `With only ${count} planets in Fixed signs, you may lack persistence, stability, or commitment to see things through.`,
    Mutable: `With only ${count} planets in Mutable signs, you may have difficulty adapting, processing change, or being flexible.`
  };
  return descriptions[modality] || `Limited ${modality} energy requires conscious development.`;
}

function getModalityDevelopment(modality: string): string {
  const developments: Record<string, string> = {
    Cardinal: 'Practice taking initiative in small ways, set clear goals, and push yourself to begin new projects.',
    Fixed: 'Build consistent routines, practice patience with long-term goals, and develop staying power through persistence.',
    Mutable: 'Practice flexibility in daily situations, study different perspectives, and develop comfort with uncertainty.'
  };
  return developments[modality] || '';
}

function generateModalityIntegrationAdvice(modalities: Record<string, number>): string {
  const total = Object.values(modalities).reduce((sum, count) => sum + count, 0);
  const sorted = Object.entries(modalities).sort((a, b) => b[1] - a[1]);
  
  if (sorted[0][1] > total * 0.6) {
    return `Your strong ${sorted[0][0]} nature needs balancing with ${sorted[2][0]} flexibility and ${sorted[1][0]} qualities.`;
  }
  
  return 'Your modalities are relatively balanced, giving you access to different action styles as needed.';
}

function getOverallModalityPersonality(dominant: string, lacking: string): string {
  const combinations: Record<string, Record<string, string>> = {
    Cardinal: {
      Fixed: 'Your leadership initiative needs balancing with sustained follow-through and patient persistence.',
      Mutable: 'Your decisive action needs tempering with adaptive flexibility and information processing.'
    },
    Fixed: {
      Cardinal: 'Your steady persistence needs energizing with initiative, leadership, and willingness to start new things.',
      Mutable: 'Your determined focus needs balancing with adaptability, flexibility, and openness to change.'
    },
    Mutable: {
      Cardinal: 'Your adaptive flexibility needs strengthening with decisive leadership and confident initiative.',
      Fixed: 'Your changeable nature needs grounding with sustained commitment and persistent effort.'
    }
  };
  
  return combinations[dominant]?.[lacking] || 'Your modal mix creates a unique approach to taking action in life.';
}

// Helper functions for dispositor analysis
function parseDispositorChains(dispositorData: string): Array<{planet: string, chain: string[]}> {
  const chains: Array<{planet: string, chain: string[]}> = [];
  
  dispositorData.split('\n').forEach(line => {
    const parts = line.split('→').map(part => part.trim());
    if (parts.length > 1) {
      const planet = parts[0];
      const chain = parts.slice(1).map(p => p.replace(/\(.*?\)/g, '').trim());
      chains.push({ planet, chain });
    }
  });
  
  return chains;
}

function analyzeDispositorStructure(chains: Array<{planet: string, chain: string[]}>) {
  const finalDispositors = new Set<string>();
  const cycles: Set<string> = new Set(); // Use Set to avoid duplicates
  const chainLengths: Record<string, number> = {};
  
  chains.forEach(({ planet, chain }) => {
    chainLengths[planet] = chain.length;
    
    // Check for final dispositor - look for "(final)" marker
    if (chain.some(step => step.includes('final'))) {
      finalDispositors.add(planet);
    }
    
    // Check for cycles - look for "(cycle)" marker
    if (chain.some(step => step.includes('cycle'))) {
      // Extract unique cycle participants from the chain
      const cycleElements = chain.filter(step => !step.includes('(') && step.trim() !== '');
      if (cycleElements.length > 0) {
        // Create a sorted cycle signature to avoid duplicates
        const uniqueCyclePlanets = [...new Set([planet, ...cycleElements])].sort();
        cycles.add(uniqueCyclePlanets.join('-'));
      }
    }
  });
  
  // Convert cycle set back to arrays for display
  const cycleArrays = Array.from(cycles).map(cycle => cycle.split('-'));
  
  const pattern = finalDispositors.size === 1 ? 'autocratic' :
                  finalDispositors.size === 2 ? 'dual-authority' :
                  cycles.size > 0 ? 'mutual-reception' : 'distributed';
  
  return {
    finalDispositors: Array.from(finalDispositors),
    cycles: cycleArrays,
    chainLengths,
    pattern
  };
}

function formatDispositorChains(chains: Array<{planet: string, chain: string[]}>): string {
  return chains.slice(0, 8).map(({ planet, chain }) => 
    `${planet} → ${chain.join(' → ')}`
  ).join('\n');
}

function getFinalDispositorDescription(planet: string): string {
  const descriptions: Record<string, string> = {
    Sun: 'Your core identity and creative self-expression holds ultimate authority over all other planetary energies.',
    Moon: 'Your emotional needs and intuitive responses govern all other planetary functions and decisions.',
    Mercury: 'Your communication and thinking patterns control how all other planetary energies are expressed.',
    Venus: 'Your values and relationship needs determine how all other planetary energies manifest.',
    Mars: 'Your desire nature and assertive will drives all other planetary expressions and choices.',
    Jupiter: 'Your growth orientation and philosophical beliefs guide all other planetary developments.',
    Saturn: 'Your discipline and structural needs organize and limit all other planetary expressions.'
  };
  return descriptions[planet] || `${planet} serves as the ultimate organizing principle for your planetary energies.`;
}

function getMutualReceptionDescription(cycle: string[]): string {
  if (cycle.length === 2) {
    return `${cycle[0]} and ${cycle[1]} support each other equally, creating a balanced power-sharing arrangement that strengthens both energies.`;
  } else if (cycle.length === 3) {
    return `${cycle[0]}, ${cycle[1]}, and ${cycle[2]} form a three-way cooperative cycle, each planet supporting the next in a flowing triangle of mutual empowerment.`;
  }
  return `${cycle.join(', ')} form a complex cooperative power cycle, each supporting the others in a circular flow of mutual empowerment.`;
}

function getChainLengthAnalysis(chainLengths: Record<string, number>): string {
  const avgLength = Object.values(chainLengths).reduce((sum, len) => sum + len, 0) / Object.keys(chainLengths).length;
  
  if (avgLength < 2) {
    return 'Short chains indicate direct access to personal power with minimal intermediate steps.';
  } else if (avgLength > 3) {
    return 'Long chains suggest complex power structures requiring multiple steps to access core authority.';
  }
  return 'Moderate chains indicate balanced power access with some intermediate organizational steps.';
}

function getDispositorPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    'autocratic': 'Single final dispositor creates unified but potentially rigid personality organization.',
    'dual-authority': 'Two final dispositors create dynamic tension requiring conscious integration of different authority centers.',
    'mutual-reception': 'Mutual reception cycles create cooperative power-sharing with strong internal support systems.',
    'distributed': 'Multiple authority centers create complex but flexible personality organization.'
  };
  return descriptions[pattern] || 'Unique power structure creates distinctive personality organization.';
}

function getDispositorPersonalityImplications(pattern: string, finalDispositors: string[]): string {
  if (pattern === 'autocratic' && finalDispositors.length === 1) {
    const planet = finalDispositors[0];
    const implications: Record<string, string> = {
      Sun: 'All decisions ultimately serve your creative self-expression and personal identity development.',
      Moon: 'All choices ultimately serve your emotional security and intuitive wisdom.',
      Saturn: 'All actions ultimately serve your need for structure, achievement, and lasting accomplishment.'
    };
    return implications[planet] || `All planetary energies ultimately serve your ${planet.toLowerCase()} function.`;
  }
  
  if (pattern === 'dual-authority') {
    return `You must consciously integrate ${finalDispositors.join(' and ')} energies to achieve internal harmony and effective action.`;
  }
  
  return 'Your complex power structure requires conscious coordination but offers exceptional versatility and adaptability.';
}

function getDispositorIntegrationAdvice(finalDispositors: string[], cycles: string[][]): string {
  if (finalDispositors.length === 1) {
    return `Focus on developing your ${finalDispositors[0].toLowerCase()} function as it organizes all other planetary energies. Strengthen this area for maximum life effectiveness.`;
  }
  
  if (cycles.length > 0) {
    return `Cultivate the mutual support between your ${cycles[0].join(' and ')} functions. These cooperative relationships are your greatest strength.`;
  }
  
  return `Work on conscious coordination between your multiple authority centers: ${finalDispositors.join(', ')}. Integration of these different power sources is key to your success.`;
}