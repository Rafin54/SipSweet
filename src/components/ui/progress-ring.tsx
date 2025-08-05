'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { progressUtils } from '@/lib/utils';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  petals?: number;
  flowerType?: 'rose' | 'tulip' | 'daisy';
  showPercentage?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  percentage,
  size = 200,
  strokeWidth = 8,
  petals = 8,
  flowerType = 'rose',
  showPercentage = true,
  className,
  children,
}: ProgressRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  // Animate the progress on mount and when percentage changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
  
  const completedPetals = progressUtils.getPetalsCompleted(percentage, petals);
  
  // Flower colors based on type
  const flowerColors = {
    rose: '#F8D7DA',
    tulip: '#E6D0EC', 
    daisy: '#DFF4E3',
  };
  
  const flowerColor = flowerColors[flowerType];
  
  // Generate petal positions around the circle
  const petalPositions = Array.from({ length: petals }, (_, i) => {
    const angle = (i * 360) / petals - 90; // Start from top
    const petalRadius = radius + strokeWidth / 2;
    const x = size / 2 + petalRadius * Math.cos((angle * Math.PI) / 180);
    const y = size / 2 + petalRadius * Math.sin((angle * Math.PI) / 180);
    return { x, y, angle, completed: i < completedPetals };
  });

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-dew-blue opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={flowerColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
        
        {/* Flower petals */}
        {petalPositions.map((petal, index) => (
          <g key={index}>
            {/* Petal shape */}
            <ellipse
              cx={petal.x}
              cy={petal.y}
              rx={6}
              ry={12}
              fill={petal.completed ? flowerColor : '#D7EFFA'}
              className={cn(
                'transition-all duration-300',
                petal.completed ? 'opacity-100 scale-100' : 'opacity-40 scale-75'
              )}
              transform={`rotate(${petal.angle} ${petal.x} ${petal.y})`}
              style={{
                filter: petal.completed ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none',
              }}
            />
            
            {/* Petal highlight */}
            {petal.completed && (
              <ellipse
                cx={petal.x}
                cy={petal.y - 3}
                rx={3}
                ry={6}
                fill="white"
                opacity={0.3}
                transform={`rotate(${petal.angle} ${petal.x} ${petal.y - 3})`}
                className="animate-pulse"
              />
            )}
          </g>
        ))}
        
        {/* Center flower */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={12}
          fill={flowerColor}
          className="opacity-80"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={6}
          fill="white"
          className="opacity-60"
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          showPercentage && (
            <div className="text-center">
              <div className="text-2xl font-bold text-charcoal font-heading">
                {Math.round(animatedPercentage)}%
              </div>
              <div className="text-sm text-charcoal opacity-70 font-body">
                Complete
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
