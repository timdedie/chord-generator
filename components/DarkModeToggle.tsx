// src/components/theme-selector.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define the type for our theme values for better type safety
type Theme = "light" | "dark" | "system";

export default function ThemeSelector() {
    // State to hold the current theme choice.
    // We initialize it from localStorage or default to "system".
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as Theme) || "system";
        }
        return "system";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove previous theme classes
        root.classList.remove("light", "dark");

        // Apply the new theme
        if (theme === "system") {
            // If theme is 'system', we check the OS preference and apply it
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);

            // Set up a listener to react to OS theme changes
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                root.classList.toggle("dark", e.matches);
            };
            mediaQuery.addEventListener("change", handleChange);

            // Cleanup the listener when the component unmounts or theme changes
            return () => mediaQuery.removeEventListener("change", handleChange);

        } else {
            // If a specific theme is chosen, apply it directly
            root.classList.add(theme);
        }

    }, [theme]);

    const handleThemeChange = (value: Theme) => {
        setTheme(value);
        localStorage.setItem("theme", value);
    };

    return (
        <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-40">
                <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">
                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                    </div>
                </SelectItem>
                <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                    </div>
                </SelectItem>
                <SelectItem value="system">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}