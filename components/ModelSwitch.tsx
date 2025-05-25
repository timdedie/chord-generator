"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ModelSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    id?: string; // Added id as an optional prop
}

export default function ModelSwitch({
                                        checked,
                                        onCheckedChange,
                                        disabled,
                                        label = "Creative Mode ✨", // Default label updated
                                        id, // Destructure the id prop
                                    }: ModelSwitchProps) {
    // If an id is provided, use it; otherwise, create a default one for association.
    // This ensures the Label's htmlFor always matches the Switch's id.
    const switchId = id || `model-switch-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id={switchId} // Use the determined ID
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                aria-label={label}
            />
            <Label
                htmlFor={switchId} // Use the same ID for the label
                className={`text-sm text-gray-600 dark:text-gray-300 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            >
                {label}
            </Label>
        </div>
    );
}