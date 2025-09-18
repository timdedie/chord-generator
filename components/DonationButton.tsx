'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export function DonationButton() {
  const handleDonationClick = () => {
    window.open('https://paypal.me/timdedie', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <span className="text-gray-500 text-xs">
        Buy me a coffee
      </span>
      <button
        onClick={handleDonationClick}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 group"
        aria-label="Donate via PayPal"
      >
        <Heart className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    </div>
  );
}