"use client";

import { useEffect, useState } from "react";

export default function HubLoadingScreen({
    onFinish,
}: {
    onFinish: () => void;
}) {
    const [progress, setProgress] = useState(0);

    /* 
      🔁 TEXT LOOP STATE
      - This cycles through your loading messages
      - You can add/remove messages freely
    */
    const messages = [
        "chanting...",
        "reciting...",
        "summoning portals...",
    ];
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        /* 
          📊 PROGRESS LOGIC
          - Random increments for natural loading feel
        */
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    onFinish(); // 🔥 triggers hub open
                    return 100;
                }
                return Math.min(prev + Math.random() * 15 + 5, 100);
            });
        }, 300);

        return () => clearInterval(interval);
    }, [onFinish]);

    useEffect(() => {
        /* 
          🔁 TEXT LOOP
          - Changes message every 1 second
          - Loops infinitely
        */
        const textInterval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % messages.length);
        }, 1000);

        return () => clearInterval(textInterval);
    }, []);

    return (
        <main className="w-full">
            {/* 
        🎨 FULLSCREEN LOADER
        - Background color: #222035 (your chosen theme)
        - flex column to stack items vertically
      */}
            <div className="fixed inset-0 bg-[#222035] flex flex-col items-center justify-center z-50">

                {/* 
          🎥 CENTER ANIMATION (VIDEO)
          ⚠️ IMPORTANT:
          - Use PUBLIC path, not local disk path
          - public/assests/... → /assests/...
        */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-40 md:w-60 pixel-video"
                >
                    <source
                        src="/assests/loader-gifs/hub-loader-gif.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* 
          📊 LOADING PERCENTAGE
          - Rounded value for cleaner UI
        */}
                <p className="text-white text-xl mt-4">
                    {Math.floor(progress)}%
                </p>

                {/* 
          🔁 LOOPING TEXT MESSAGE
          - Uses textIndex to rotate messages
        */}
                <p className="text-gray-300 text-lg mt-2 animate-pulse">
                    {messages[textIndex]}
                </p>

            </div>
        </main>
    );
}