"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ModelSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string; // Keep label prop for flexibility, but we'll use a default if not provided by ChordGenerator
    // description?: string; // REMOVED description prop
}

export default function ModelSwitch({
                                        checked,
                                        onCheckedChange,
                                        disabled,
                                        label = "Deep Think", // Default label will be used by ChordGenerator
                                    }: ModelSwitchProps) {
    return (
        // Removed the outer div that was for label + description column
        <div className="flex items-center space-x-2">
            <Switch
                id="model-switch" // Ensure this ID is unique if multiple switches are on a page, or pass it as a prop
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                aria-label={label} // Good for accessibility
            />
            <Label htmlFor="model-switch" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                {label}
            </Label>
            {/* Description paragraph REMOVED */}
        </div>
    );
}