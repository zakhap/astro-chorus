'use client';

import React, { useState } from 'react';
import type { BirthInfo } from '@/types/astrology';

interface BirthInfoFormProps {
  onSubmit: (birthInfo: BirthInfo) => void;
  loading?: boolean;
}

export default function BirthInfoForm({ onSubmit, loading = false }: BirthInfoFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    latitude: 0,
    longitude: 0
  });

  // Simple location geocoding - in a real app you'd use Google Places API or similar
  const handleLocationChange = async (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    
    // For MVP, we'll use some major cities as examples
    const cities: Record<string, { lat: number; lng: number }> = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'sydney': { lat: -33.8688, lng: 151.2093 }
    };
    
    const key = location.toLowerCase();
    if (cities[key]) {
      setFormData(prev => ({
        ...prev,
        latitude: cities[key].lat,
        longitude: cities[key].lng
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.location) {
      alert('Please fill in all fields');
      return;
    }
    
    if (formData.latitude === 0 && formData.longitude === 0) {
      alert('Please enter a recognized city or coordinates');
      return;
    }

    const birthInfo: BirthInfo = {
      date: formData.date,
      time: formData.time + ':00', // Add seconds
      location: {
        name: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude
      }
    };

    onSubmit(birthInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            ✨ Astro Critics ✨
          </h1>
          <p className="text-gray-300 text-sm">
            Enter your birth details to chat with the planets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="e.g., New York, London, Tokyo"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Try: New York, Los Angeles, Chicago, London, Paris, Tokyo, Sydney
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating your chart...
              </span>
            ) : (
              'Chat with the Planets'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Your birth information is used only to generate your astrological reading and is not stored.</p>
        </div>
      </div>
    </div>
  );
}