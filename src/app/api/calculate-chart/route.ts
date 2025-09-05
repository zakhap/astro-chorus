import { NextRequest, NextResponse } from 'next/server';
import { chart2txt } from 'chart2txt';

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

// Function to geocode location using Photon API
async function geocodeLocation(locationString: string): Promise<{ latitude: number; longitude: number }> {
  try {
    const params = new URLSearchParams();
    params.append("layer", "city");
    params.append("layer", "district");
    params.append("q", locationString);
    params.append("limit", "1");

    const response = await fetch(`https://photon.komoot.io/api?${params.toString()}`);
    const data = await response.json();

    if (data?.features && data.features.length > 0) {
      const coordinates = data.features[0].geometry.coordinates;
      return {
        latitude: coordinates[1],  // GeoJSON format returns [longitude, latitude]
        longitude: coordinates[0]
      };
    }

    throw new Error("Failed to retrieve location data");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Failed to geocode location");
  }
}

const ASTRO_API_ENDPOINT = "https://simple-astro-api.netlify.app/api/positions";

interface PlanetPosition {
  name: string;
  longitude: number;
  speed?: number;
  retrograde?: boolean;
}

interface CalculationResult {
  planets: PlanetPosition[];
  ascendant: number;
  midheaven: number;
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

// Function to get planetary positions from simple-astro-api
async function getPlanetaryPositions(
  date: string,
  time: string,
  lat: number,
  lng: number,
): Promise<CalculationResult> {
  try {
    const url = `${ASTRO_API_ENDPOINT}?date=${date}&time=${time}&lat=${lat}&lng=${lng}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    throw new Error("Failed to get astrological data");
  }
}

// Generate human-readable chart description using chart2txt
function generateChartDescription(astrologyData: any, locationName: string, date: string, time: string): string {
  try {
    // Convert our data format to chart2txt format
    // The key is that chart2txt expects 'degree' to be the longitude value (0-360)
    const chart2txtData = {
      name: 'Birth Chart', // Required field
      planets: astrologyData.planets.map((planet: any) => ({
        name: planet.name,
        degree: planet.longitude, // Use longitude directly as degree
      })),
      ascendant: astrologyData.ascendant,
      location: locationName,
      timestamp: new Date(`${date.replace(/-/g, "/")} ${time.replace(/-/g, ":")}`),
    };

    return chart2txt(chart2txtData, { houseSystem: "whole_sign" });
  } catch (error) {
    console.error('Error generating chart description:', error);
    return 'Chart description unavailable';
  }
}

// Calculate aspects between planets
function calculateAspects(planets: Array<{name: string; longitude: number}>) {
  const aspects: Array<{planet1: string; planet2: string; aspect: string; orb: number; exactDegrees: number}> = [];
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

export async function GET() {
  return NextResponse.json({ message: 'API route is working' });
}

export async function POST(request: NextRequest) {
  console.log('API route called');
  try {
    const { date, time, location } = await request.json();
    console.log('Request data:', { date, time, location });
    
    if (!date || !time || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, time, location' },
        { status: 400 }
      );
    }

    // Geocode the location
    let coordinates;
    if (location.latitude && location.longitude) {
      coordinates = { latitude: location.latitude, longitude: location.longitude };
    } else {
      coordinates = await geocodeLocation(location.name || location);
    }

    // Get astrological data from simple-astro-api
    const astroData = await getPlanetaryPositions(
      date,
      time,
      coordinates.latitude,
      coordinates.longitude
    );

    // Transform the data to match our existing format
    const planetPositions = astroData.planets.map((planet) => ({
      name: planet.name,
      longitude: planet.longitude,
      speed: planet.speed || 1, // Default positive speed
      retrograde: planet.speed ? planet.speed < 0 : false,
      ...getSignAndDegree(planet.longitude)
    }));

    // Extract individual planets for compatibility
    const sun = planetPositions.find(p => p.name === 'Sun') || planetPositions.find(p => p.name.toLowerCase().includes('sun'));
    const moon = planetPositions.find(p => p.name === 'Moon') || planetPositions.find(p => p.name.toLowerCase().includes('moon'));
    const mercury = planetPositions.find(p => p.name === 'Mercury') || planetPositions.find(p => p.name.toLowerCase().includes('mercury'));
    const venus = planetPositions.find(p => p.name === 'Venus') || planetPositions.find(p => p.name.toLowerCase().includes('venus'));
    const mars = planetPositions.find(p => p.name === 'Mars') || planetPositions.find(p => p.name.toLowerCase().includes('mars'));
    const jupiter = planetPositions.find(p => p.name === 'Jupiter') || planetPositions.find(p => p.name.toLowerCase().includes('jupiter'));
    const saturn = planetPositions.find(p => p.name === 'Saturn') || planetPositions.find(p => p.name.toLowerCase().includes('saturn'));
    const uranus = planetPositions.find(p => p.name === 'Uranus') || planetPositions.find(p => p.name.toLowerCase().includes('uranus'));
    const neptune = planetPositions.find(p => p.name === 'Neptune') || planetPositions.find(p => p.name.toLowerCase().includes('neptune'));
    const pluto = planetPositions.find(p => p.name === 'Pluto') || planetPositions.find(p => p.name.toLowerCase().includes('pluto'));
    const northNode = planetPositions.find(p => p.name === 'North Node') || planetPositions.find(p => p.name.toLowerCase().includes('node'));
    
    // Calculate aspects
    const aspects = calculateAspects(planetPositions);
    
    // Create house information (simplified for now)
    const houseNames = [
      '1st House (Self)', '2nd House (Resources)', '3rd House (Communication)', 
      '4th House (Home)', '5th House (Creativity)', '6th House (Service)',
      '7th House (Partnership)', '8th House (Transformation)', '9th House (Philosophy)',
      '10th House (Career)', '11th House (Community)', '12th House (Spirituality)'
    ];
    
    // Generate basic house cusps based on ascendant
    const houseCusps: number[] = [];
    for (let i = 0; i < 12; i++) {
      houseCusps.push((astroData.ascendant + (i * 30)) % 360);
    }
    
    const houseInfo = houseCusps.map((cusp, index) => ({
      number: index + 1,
      name: houseNames[index],
      cusp: cusp,
      sign: ZODIAC_SIGNS[Math.floor(cusp / 30)],
      degree: Math.round((cusp % 30) * 100) / 100
    }));
    
    const astrologyReading = {
      sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, northNode,
      planets: planetPositions,
      aspects,
      houses: houseInfo,
      ascendant: astroData.ascendant,
      midheaven: astroData.midheaven,
      houseCusps,
      birthInfo: { 
        date, 
        time, 
        location: {
          name: location.name || location,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      },
      timezone: 'UTC' // Simple-astro-api handles timezone internally
    };

    // Generate human-readable chart description for AI characters
    const chartDescription = generateChartDescription(astrologyReading, location.name || location.toString(), date, time);
    astrologyReading.chartDescription = chartDescription;

    return NextResponse.json(astrologyReading);
    
  } catch (error: unknown) {
    console.error('Chart calculation error:', error);
    return NextResponse.json(
      { error: `Failed to calculate astrology chart: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}