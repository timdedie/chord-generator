'use client';

import { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';

export default function CopyEmail({ email }: { email: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="group w-full text-left p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/50 transition-all hover:shadow-xl mb-12 cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-500 mb-1">
                        Email us
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors break-all">
                        {email}
                    </p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200">
                    {copied ? (
                        <Check className="h-5 w-5 text-green-500 transition-all duration-200 scale-110" />
                    ) : (
                        <Copy className="h-5 w-5 text-gray-400 group-hover:text-primary transition-all duration-200" />
                    )}
                </div>
            </div>
        </button>
    );
}
