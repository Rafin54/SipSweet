'use client';

import React, { useState } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { cn, animationUtils } from '@/lib/utils';
import { SIP_AMOUNTS } from '@/types/app';

interface SipButtonProps {
  onSip: (amount: number) => Promise<boolean>;
  flowerType?: 'rose' | 'tulip' | 'daisy';
  disabled?: boolean;
  className?: string;
}

export function SipButton({ onSip, flowerType = 'rose', disabled = false, className }: SipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAmountSelector, setShowAmountSelector] = useState(false);

  const flowerColors = {
    rose: 'from-blossom-pink to-lilac-lavender',
    tulip: 'from-lilac-lavender to-dew-blue',
    daisy: 'from-mint-green to-blossom-pink',
  };

  const handleQuickSip = async (amount: number) => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    setShowAmountSelector(false);
    
    try {
      await onSip(amount);
      
      // Trigger celebration animation
      const button = document.getElementById('sip-button');
      if (button) {
        animationUtils.triggerPetalPop(button);
      }
    } catch (error) {
      console.error('Error logging sip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultAmount = SIP_AMOUNTS[1].amount; // Regular sip (250ml)

  return (
    <div className={cn('relative flex flex-col items-center space-y-4', className)}>
      {/* Main Sip Button */}
      <button
        id="sip-button"
        onClick={() => handleQuickSip(defaultAmount)}
        disabled={disabled || isLoading}
        className={cn(
          'relative w-32 h-32 rounded-full',
          'bg-gradient-to-br shadow-2xl',
          'transform transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-blossom-pink focus:ring-opacity-50',
          'active:scale-95 hover:scale-105',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          flowerColors[flowerType]
        )}
      >
        {/* Button content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal">
          {isLoading ? (
            <div className="animate-spin">
              <Droplets className="w-8 h-8" />
            </div>
          ) : (
            <>
              <Droplets className="w-8 h-8 mb-1" />
              <span className="text-sm font-semibold font-body">
                +{defaultAmount}ml
              </span>
            </>
          )}
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-200" />
        
        {/* Petal decorations */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full opacity-30" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full opacity-20" />
      </button>
      
      {/* Amount selector toggle */}
      <button
        onClick={() => setShowAmountSelector(!showAmountSelector)}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center space-x-2 px-4 py-2 rounded-full',
          'bg-white bg-opacity-50 backdrop-blur-sm',
          'text-charcoal text-sm font-medium',
          'hover:bg-opacity-70 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blossom-pink focus:ring-opacity-50',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Other amounts</span>
      </button>
      
      {/* Amount selector */}
      {showAmountSelector && (
        <div className="absolute top-full mt-2 bg-white rounded-2xl shadow-xl border border-blossom-pink border-opacity-20 p-4 z-10">
          <div className="grid grid-cols-1 gap-2 min-w-[200px]">
            {SIP_AMOUNTS.map((sip) => (
              <button
                key={sip.amount}
                onClick={() => handleQuickSip(sip.amount)}
                disabled={disabled || isLoading}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl',
                  'bg-blossom-pink bg-opacity-20 hover:bg-opacity-40',
                  'text-charcoal transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blossom-pink focus:ring-opacity-50',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{sip.emoji}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{sip.label}</div>
                    <div className="text-xs opacity-70">+{sip.amount}ml</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
