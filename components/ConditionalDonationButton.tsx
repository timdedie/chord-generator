"use client";

import { usePathname } from "next/navigation";
import { DonationButton } from "@/components/DonationButton";

const PAGES_WITHOUT_DONATION = ["/", "/results"];

export function ConditionalDonationButton() {
    const pathname = usePathname();

    if (PAGES_WITHOUT_DONATION.includes(pathname)) {
        return null;
    }

    return <DonationButton />;
}
