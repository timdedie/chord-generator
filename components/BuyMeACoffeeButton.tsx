import React from 'react';
import Image from 'next/image';

export default function BuyMeACoffeeButton() {
    return (
        <a
            href="https://www.paypal.com/paypalme/timdedie"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-transform hover:scale-105 hover:shadow-xl"
        >
            <Image src="/paypal/paypal-logo.png" alt="PayPal" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
            <span>Buy me a coffee :)</span>
        </a>
    );
}
