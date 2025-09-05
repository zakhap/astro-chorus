import { NextRequest, NextResponse } from 'next/server';
import * as sweph from 'sweph';

// Initialize sweph
try {
  sweph.set_ephe_path(process.env.SWEPH_PATH || './ephemeris');
} catch (error) {
  console.warn('Could not set ephemeris path:', error);
}

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Helper function to convert longitude to zodiac sign and degree
function getSignAndDegree(longitude: number): { sign: string; degree: number } {
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.round(degree * 100) / 100
  };
}

// Simplified timezone handling for MVP
function getSimpleTimezoneOffset(cityName: string): number {
  const timezones: Record<string, number> = {
    'new york': -5, 'los angeles': -8, 'chicago': -6, 'london': 0,
    'paris': 1, 'tokyo': 9, 'sydney': 11, 'berlin': 1, 'moscow': 3,
    'mumbai': 5.5, 'beijing': 8, 'dubai': 4, 'singapore': 8,
    'san francisco': -8
  };
  
  const key = cityName.toLowerCase();
  return timezones[key] || 0;
}

// Calculate aspects between planets
function calculateAspects(planets: any[]) {
  const aspects: any[] = [];
  const aspectTypes = [
    { name: 'Conjunction', degrees: 0, orb: 8 },
    { name: 'Opposition', degrees: 180, orb: 8 },
    { name: 'Trine', degrees: 120, orb: 8 },
    { name: 'Square', degrees: 90, orb: 8 },
    { name: 'Sextile', degrees: 60, orb: 6 },
    { name: 'Quincunx', degrees: 150, orb: 3 },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectTypes) {
        const orb = Math.abs(diff - aspectType.degrees);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            aspect: aspectType.name,
            orb: Math.round(orb * 100) / 100,
            exactDegrees: aspectType.degrees
          });
          break;
        }
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

export async function POST(request: NextRequest) {
  try {
    const { date, time, location } = await request.json();
    
    if (!date || !time || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, time, location' },
        { status: 400 }
      );
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute, second = 0] = time.split(':').map(Number);
    
    // Get timezone offset
    const tzOffset = getSimpleTimezoneOffset(location.name);
    
    // Adjust for timezone
    let adjustedYear = year;
    let adjustedMonth = month;
    let adjustedDay = day;
    let adjustedHour = hour + tzOffset;
    
    // Handle day changes due to timezone
    if (adjustedHour < 0) {
      const dateObj = new Date(year, month - 1, day - 1);
      adjustedYear = dateObj.getFullYear();
      adjustedMonth = dateObj.getMonth() + 1;
      adjustedDay = dateObj.getDate();
      adjustedHour += 24;
    } else if (adjustedHour >= 24) {
      const dateObj = new Date(year, month - 1, day + 1);
      adjustedYear = dateObj.getFullYear();
      adjustedMonth = dateObj.getMonth() + 1;
      adjustedDay = dateObj.getDate();
      adjustedHour -= 24;
    }
    
    // Calculate Julian day
    const julday = sweph.julday(
      adjustedYear,
      adjustedMonth,
      adjustedDay,
      adjustedHour + minute / 60 + second / 3600,
      sweph.constants.SE_GREG_CAL
    );
    
    // Define planets
    const planets = [
      { id: sweph.constants.SE_SUN, name: 'Sun' },
      { id: sweph.constants.SE_MOON, name: 'Moon' },
      { id: sweph.constants.SE_MERCURY, name: 'Mercury' },
      { id: sweph.constants.SE_VENUS, name: 'Venus' },
      { id: sweph.constants.SE_MARS, name: 'Mars' },
      { id: sweph.constants.SE_JUPITER, name: 'Jupiter' },
      { id: sweph.constants.SE_SATURN, name: 'Saturn' },
      { id: sweph.constants.SE_URANUS, name: 'Uranus' },
      { id: sweph.constants.SE_NEPTUNE, name: 'Neptune' },
      { id: sweph.constants.SE_PLUTO, name: 'Pluto' },
      { id: sweph.constants.SE_TRUE_NODE, name: 'North Node' },
    ];

    // Calculate positions for each planet
    const planetPositions = planets.map((planet) => {
      const result = sweph.calc_ut(
        julday,
        planet.id,
        sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED
      );
      return {
        name: planet.name,
        longitude: result.data[0],
        speed: result.data[3],
        retrograde: result.data[3] < 0,
        ...getSignAndDegree(result.data[0])
      };
    });

    // Extract individual planets for compatibility
    const sun = planetPositions.find(p => p.name === 'Sun')!;
    const moon = planetPositions.find(p => p.name === 'Moon')!;
    const mercury = planetPositions.find(p => p.name === 'Mercury')!;
    const venus = planetPositions.find(p => p.name === 'Venus')!;
    const mars = planetPositions.find(p => p.name === 'Mars')!;
    const jupiter = planetPositions.find(p => p.name === 'Jupiter')!;
    const saturn = planetPositions.find(p => p.name === 'Saturn')!;
    const uranus = planetPositions.find(p => p.name === 'Uranus')!;
    const neptune = planetPositions.find(p => p.name === 'Neptune')!;
    const pluto = planetPositions.find(p => p.name === 'Pluto')!;
    const northNode = planetPositions.find(p => p.name === 'North Node')!;
    
    // Calculate houses
    const houses = sweph.houses(julday, location.latitude, location.longitude, 'P');
    
    // Calculate aspects
    const aspects = calculateAspects(planetPositions);
    
    // Create detailed house information
    const houseNames = [
      '1st House (Self)', '2nd House (Resources)', '3rd House (Communication)', 
      '4th House (Home)', '5th House (Creativity)', '6th House (Service)',
      '7th House (Partnership)', '8th House (Transformation)', '9th House (Philosophy)',
      '10th House (Career)', '11th House (Community)', '12th House (Spirituality)'
    ];
    
    const houseInfo = houses.data.houses.map((cusp: number, index: number) => ({
      number: index + 1,
      name: houseNames[index],
      cusp: cusp,
      sign: ZODIAC_SIGNS[Math.floor(cusp / 30)],
      degree: Math.round((cusp % 30) * 100) / 100
    }));
    
    // Determine timezone string
    const timezone = `UTC${tzOffset >= 0 ? '+' : ''}${tzOffset}`;
    
    const astrologyReading = {
      sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, northNode,
      planets: planetPositions,
      aspects,
      houses: houseInfo,
      ascendant: houses.data.points[0],
      midheaven: houses.data.points[1],
      houseCusps: houses.data.houses,
      birthInfo: { date, time, location },
      timezone
    };

    return NextResponse.json(astrologyReading);
    
  } catch (error: any) {
    console.error('Chart calculation error:', error);
    return NextResponse.json(
      { error: `Failed to calculate astrology chart: ${error.message}` },
      { status: 500 }
    );
  }
}