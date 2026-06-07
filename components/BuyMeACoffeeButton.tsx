import React from 'react';
import Image from 'next/image';

export default function BuyMeACoffeeButton() {
    return (
        <a
            href="https://www.paypal.com/paypalme/timdedie"
            target="_blank"
            rel="noopener noreferrer"
            className="group fixed bottom-4 right-4 z-50 flex items-center gap-0 overflow-hidden rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-lg h-11 w-11 px-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-[width,gap,padding-right] duration-300 ease-out hover:w-44 hover:gap-2 hover:px-4 hover:shadow-xl"
        >
            <Image src="/paypal/paypal-logo.png" alt="PayPal" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">Buy me a coffee :)</span>
        </a>
    );
}
