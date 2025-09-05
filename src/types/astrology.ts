export interface BirthInfo {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  speed: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  exactDegrees: number;
}

export interface House {
  number: number;
  name: string;
  cusp: number;
  sign: string;
  degree: number;
}

export interface AstrologyReading {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  northNode: PlanetPosition;
  planets: PlanetPosition[];
  aspects: Aspect[];
  houses: House[];
  ascendant: number;
  midheaven: number;
  houseCusps: number[];
  birthInfo: BirthInfo;
  timezone: string;
}

export interface ChatMessage {
  id: string;
  character: 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northNode' | 'user';
  content: string;
  timestamp: Date;
}

export interface PlanetaryCharacter {
  name: string;
  sign: string;
  element: string;
  personality: string;
  tarotCard: string;
  color: string;
  emoji: string;
}