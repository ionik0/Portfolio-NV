"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({
    onFinish,
}: {
    onFinish: () => void;
}) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    onFinish();
                    return 100;
                }
                return prev + Math.random() * 15 + 5;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="outerBorder">
                <div className="container">
                    <div className="ghostWrapper left">
                        <div className="ghost">
                            <div className="body">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i}></div>
                                ))}
                            </div>
                            <div className="eye left">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div className="eye right">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                    <div className="pacmanWrapper">
                        <div className="pacmanBody">
                            <div className="pacman top"></div>
                            <div className="pacman left"></div>
                            <div className="pacman bottom"></div>
                            <div className="eye"></div>
                        </div>
                    </div>
                    <div className="ghostWrapper right">
                        <div className="ghost">
                            <div className="body">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i}></div>
                                ))}
                            </div>
                            <div className="eye left">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div className="eye right">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-white text-lg" style={{ fontFamily: "monospace" }}>
                    {Math.min(100, Math.floor(progress))}%
                </p>
            </div>
        </div>
    );
}