"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

const PAGES_WITHOUT_FOOTER = ["/", "/results"];

export function ConditionalFooter() {
    const pathname = usePathname();

    if (PAGES_WITHOUT_FOOTER.includes(pathname)) {
        return null;
    }

    return <Footer />;
}
