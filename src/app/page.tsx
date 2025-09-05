'use client';

import React, { useState, useEffect } from 'react';
import TerminalBirthForm from '@/components/TerminalBirthForm';
import TerminalChat from '@/components/TerminalChat';
import type { BirthInfo, AstrologyReading } from '@/types/astrology';
// import { calculateAstrologyChart } from '@/lib/astrology';

export default function Home() {
  const [currentView, setCurrentView] = useState<'form' | 'chat'>('form');
  const [astrologyReading, setAstrologyReading] = useState<AstrologyReading | null>(null);
  const [loading, setLoading] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const savedReading = localStorage.getItem('astroChartData');
    if (savedReading) {
      try {
        const parsedReading = JSON.parse(savedReading);
        setAstrologyReading(parsedReading);
        setCurrentView('chat');
      } catch (error) {
        console.error('Error parsing saved chart data:', error);
        localStorage.removeItem('astroChartData');
      }
    }
  }, []);

  const handleBirthInfoSubmit = async (birthInfo: BirthInfo) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/calculate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(birthInfo)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate chart');
      }

      const reading = await response.json();
      // Save to localStorage
      localStorage.setItem('astroChartData', JSON.stringify(reading));
      setAstrologyReading(reading);
      setCurrentView('chat');
    } catch (error: any) {
      console.error('Error calculating astrology chart:', error);
      alert(`There was an error calculating your chart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    // Clear localStorage when going back
    localStorage.removeItem('astroChartData');
    setCurrentView('form');
    setAstrologyReading(null);
  };

  if (currentView === 'form') {
    return (
      <TerminalBirthForm 
        onSubmit={handleBirthInfoSubmit} 
        loading={loading}
      />
    );
  }

  if (currentView === 'chat' && astrologyReading) {
    return (
      <TerminalChat 
        reading={astrologyReading}
        onBack={handleBackToForm}
      />
    );
  }

  return null;
}
