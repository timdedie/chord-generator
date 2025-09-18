"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

export function P5ChordAnimation() {
    const sketchRef = useRef<HTMLDivElement>(null);
    // Use a ref to hold the p5.js instance. This is key to the fix.
    const p5InstanceRef = useRef<p5 | null>(null);

    useEffect(() => {
        const container = sketchRef.current;

        // We only want to create a new p5 instance if one doesn't already exist.
        if (container && !p5InstanceRef.current) {
            const sketch = (p: p5) => {
                let initialPositions: p5.Vector[] = [];
                let finalPositions: p5.Vector[] = [];
                let noteDiameter: number;
                let lineSpacing: number;
                const totalFrames = 240;

                p.setup = () => {
                    p.createCanvas(container.offsetWidth, container.offsetHeight);

                    const scaleFactor = p.height / 600;
                    noteDiameter = 100 * scaleFactor;
                    lineSpacing = 120 * scaleFactor;

                    initialPositions.push(p.createVector(-180 * scaleFactor, -180 * scaleFactor));
                    initialPositions.push(p.createVector(180 * scaleFactor, -180 * scaleFactor));
                    initialPositions.push(p.createVector(0, 0));
                    initialPositions.push(p.createVector(0, 225 * scaleFactor));

                    finalPositions.push(p.createVector(0, -1.5 * lineSpacing));
                    finalPositions.push(p.createVector(0, -0.5 * lineSpacing));
                    finalPositions.push(p.createVector(0, 0.5 * lineSpacing));
                    finalPositions.push(p.createVector(0, 1.5 * lineSpacing));
                };

                p.draw = () => {
                    p.clear();
                    p.translate(p.width / 2, p.height / 2);

                    let t = (p.frameCount % totalFrames) / totalFrames;
                    let progress;

                    if (t < 0.25) {
                        progress = easeInOutCubic(p.map(t, 0, 0.25, 0, 1));
                    } else if (t < 0.5) {
                        progress = 1;
                    } else if (t < 0.75) {
                        progress = 1 - easeInOutCubic(p.map(t, 0.5, 0.75, 0, 1));
                    } else {
                        progress = 0;
                    }

                    drawStaff(progress * 255);
                    drawNotes(progress);
                };

                const drawStaff = (alpha: number) => {
                    p.stroke(220, alpha);
                    p.strokeWeight(2);
                    p.noFill();
                    const staffWidth = p.width * 0.75;
                    for (let i = -2; i <= 2; i++) {
                        const yPos = i * lineSpacing;
                        p.line(-staffWidth / 2, yPos, staffWidth / 2, yPos);
                    }
                };

                const drawNotes = (progress: number) => {
                    p.stroke(220);
                    p.strokeWeight(3);
                    p.fill(15);
                    for (let i = 0; i < 4; i++) {
                        const currentPos = p5.Vector.lerp(initialPositions[i], finalPositions[i], progress);
                        p.circle(currentPos.x, currentPos.y, noteDiameter);
                    }
                };

                const easeInOutCubic = (x: number): number => {
                    return x < 0.5 ? 4 * x * x * x : 1 - p.pow(-2 * x + 2, 3) / 2;
                };
            };

            // Store the instance in the ref
            p5InstanceRef.current = new p5(sketch, container);
        }

        // The cleanup function is called when the component unmounts.
        return () => {
            // It safely removes the p5 instance and resets the ref.
            p5InstanceRef.current?.remove();
            p5InstanceRef.current = null;
        };
    }, []); // The empty dependency array is correct.

    return <div ref={sketchRef} className="w-full h-full" />;
}