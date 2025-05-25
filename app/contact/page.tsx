import React from 'react';
import Link from 'next/link';
import { Mail, Home } from 'lucide-react';

export const metadata = {
    title: 'Contact ChordGen',
    description: 'Get in touch with the ChordGen team. We welcome your feedback, questions, and suggestions to help us improve our AI chord generator.',
};

export default function ContactPage() {
    const contactEmail = "contact@chordgen.org"; // Your actual contact email

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-primary sm:text-5xl">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        We&apos;d love to hear from you! Whether you have a question, feedback, or a feature idea, please feel free to reach out.
                    </p>
                </header>

                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-10">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                        Send Us a Message
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        The best way to contact us is by email. We will get back to you as soon as possible!
                    </p>
                    <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                        <Mail className="h-6 w-6 text-primary" />
                        <a
                            href={`mailto:${contactEmail}`}
                            className="text-lg font-medium text-primary hover:underline"
                        >
                            {contactEmail}
                        </a>
                    </div>

                    <p className="mt-6 text-gray-700 dark:text-gray-300">
                        Your feedback is very important in helping us improve ChordGen and make it the best AI chord progression generator possible.
                    </p>
                </section>

                <section className="mt-12 text-center">
                    <Link href="/" legacyBehavior>
                        <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-black transition-colors">
                            <Home className="mr-2 h-5 w-5" />
                            Back to ChordGen
                        </a>
                    </Link>
                </section>
            </div>
        </div>
    );
}