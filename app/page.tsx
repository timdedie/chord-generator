// app/page.tsx

import ClientHome from "@/components/ClientHome";
import PianoProvider from "@/components/PianoProvider"; // Import the provider

export default function HomePage() {
    return (
        <PianoProvider> {/* Provider wraps ClientHome */}
            <main>
                <ClientHome />
            </main>
        </PianoProvider>
    );
}