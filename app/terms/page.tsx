import React from 'react';
import Link from 'next/link';
import { Home, FileText } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service – ChordGen',
    description: 'Basic Terms of Service for using ChordGen.',
};

export default function TermsOfServicePage() {
    const lastUpdatedDate = "May 23, 2025";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-primary sm:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Welcome to ChordGen.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last Updated: {lastUpdatedDate}
                    </p>
                </header>

                <section className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-10">
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                        <div>
                            <h2>1. Using ChordGen</h2>
                            <p>
                                By using ChordGen (&quot;Service&quot;), available at <Link href="https://www.chordgen.org" className="text-primary hover:underline">www.chordgen.org</Link>, you agree to these basic terms. If you don&apos;t agree, please don&apos;t use the Service.
                            </p>
                            <p>
                                ChordGen provides an AI-powered tool to generate chord progressions. It&apos;s free to use.
                            </p>
                        </div>

                        <div>
                            <h2>2. Your Responsibility</h2>
                            <p>
                                Please use ChordGen responsibly. Don&apos;t use it for anything illegal or harmful, or in a way that could damage the Service or affect other users.
                            </p>
                        </div>

                        <div>
                            <h2>3. Our Content</h2>
                            <p>
                                The ChordGen website, its design, text, and graphics are owned by us. Please don&apos;t copy or misuse them.
                            </p>
                            <p>
                                ChordGen does not claim ownership of the musical ideas or chord progressions you generate using the tool. You are responsible for how you use them.
                            </p>
                        </div>

                        <div>
                            <h2>4. As-Is Service & No Guarantees</h2>
                            <p>
                                ChordGen is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without any warranties. We do our best, but we can&apos;t guarantee it will always be perfect, accurate, or available. We don&apos;t guarantee the musical quality or suitability of any generated progressions for any specific purpose. Use your own judgment.
                            </p>
                        </div>

                        <div>
                            <h2>5. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, ChordGen (and its creators) will not be liable for any damages or losses arising from your use or inability to use the Service.
                            </p>
                        </div>

                        <div>
                            <h2>6. Changes to These Terms</h2>
                            <p>
                                We might update these terms sometimes. If we do, we&apos;ll note the &quot;Last Updated&quot; date. Continuing to use ChordGen after changes means you accept the new terms.
                            </p>
                        </div>

                        <div>
                            <h2>7. Contact</h2>
                            <p>
                                If you have questions, you can reach out via our <Link href="/contact" className="text-primary hover:underline">Contact Us page</Link>.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-12 text-center">
                    <Link href="/">
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