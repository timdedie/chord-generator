"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    return (
        <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            <Moon className="h-6 w-6 text-gray-300" />
        </div>
    );
}
