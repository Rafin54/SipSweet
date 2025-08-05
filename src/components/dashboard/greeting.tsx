'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GreetingProps {
  nickname: string;
  flowerEmoji: string;
  className?: string;
}

export function Greeting({ nickname, flowerEmoji, className }: GreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Let's bloom together today!",
      "Your garden of wellness awaits!",
      "Time to nurture your beautiful self!",
      "Every sip helps you flourish!",
      "Stay hydrated, stay radiant!",
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className={cn('text-center space-y-2', className)}>
      <h1 className="text-3xl font-bold text-charcoal font-heading">
        {getTimeBasedGreeting()}, {nickname}! {flowerEmoji}
      </h1>
      <p className="text-charcoal opacity-70 font-body text-lg">
        {getMotivationalMessage()}
      </p>
    </div>
  );
}
