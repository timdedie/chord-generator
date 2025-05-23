import React from 'react';
import Link from 'next/link';
import { Home, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy – ChordGen',
    description: 'ChordGen is committed to user privacy. Learn about our data handling practices.',
};

export default function PrivacyPolicyPage() {
    const lastUpdatedDate = "May 23, 2025"; // Reflecting context date

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-primary sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Your privacy is respected at ChordGen.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last Updated: {lastUpdatedDate}
                    </p>
                </header>

                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-10">
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                        <div>
                            <h2>1. Our Commitment to Privacy</h2>
                            <p>
                                ChordGen (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is designed with user privacy as a core principle. Our goal is to provide a useful service without collecting or storing your personal data.
                            </p>
                        </div>

                        <div>
                            <h2>2. Information Collection and Use</h2>
                            <p>
                                <strong>ChordGen does not store any personal user data.</strong> You can use our services without creating an account or providing personal information.
                            </p>
                            <p>
                                <strong>Website Analytics:</strong> We use Vercel Analytics for basic website traffic analysis. Vercel Analytics is a privacy-focused tool that does not use cookies and collects only aggregated, anonymized data (such as page views and general visitor statistics) to help us understand how our website is used and to improve our service. This data is not personally identifiable.
                            </p>
                            <p>
                                <strong>Chord Progressions:</strong> Any text or musical information you input to generate chord progressions is processed to provide the service but is not stored by ChordGen or linked to any personal identifiers.
                            </p>
                        </div>

                        <div>
                            <h2>3. Information Sharing</h2>
                            <p>
                                As we do not store your personal data, we do not share it with third parties, except as necessary for the basic functioning of website analytics (as described above, in an anonymized and aggregated form) or if required by law.
                            </p>
                        </div>

                        <div>
                            <h2>4. Data Security</h2>
                            <p>
                                While we do not store personal user data, we take reasonable measures to protect the operational integrity of our website.
                            </p>
                        </div>

                        <div>
                            <h2>5. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically.
                            </p>
                        </div>

                        <div>
                            <h2>6. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us through the details provided on our <Link href="/contact" className="text-primary hover:underline">Contact Us page</Link>.
                            </p>
                        </div>
                    </div>
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