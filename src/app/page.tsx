"use client";

import { useState, useTransition, useEffect } from "react";
import LoadingScreen from "@/components/loader/loading-screen";
import ClickSpark from "@/components/ClickSpark";
import WorldHub from "@/components/scenes/world-hub";


export default function Home() {
  const [loading, setLoading] = useState(true);
  const [shutterOpen, setShutterOpen] = useState(false);
  const [shutterVisible, setShutterVisible] = useState(false);
  const [, startTransition] = useTransition();

  const handleLoadingFinish = () => {
    queueMicrotask(() => {
      startTransition(() => setLoading(false));
      setShutterOpen(true);
      setShutterVisible(true);
    });
  };

  useEffect(() => {
    if (shutterVisible) {
      const timer = setTimeout(() => {
        setShutterVisible(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shutterVisible]);


  // State for button press effect
  const [pressed, setPressed] = useState(false);

  //state for scene management to the world portal hub
  const [scene, setScene] = useState("home");

  return (
    <main className="w-full">
      {loading && <LoadingScreen onFinish={handleLoadingFinish} />}

      {/* 
      🔥 SCENE CONTROL:
      - We wrap your existing home UI inside scene === "home"
      - This ensures NOTHING changes visually
      - Only controls WHEN it renders
    */}
      {scene === "home" && shutterOpen && (
        <main className="relative h-screen w-full overflow-hidden">

          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/videos/bg-vid.mp4" type="video/mp4" />
          </video>

          {/* Overlay (IMPORTANT for readability) 
        <div className="absolute inset-0 bg-black/50"></div>*/}

          {/* GIF Overlay Container 
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img src="/assests/shield-gifs/shield_01_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "20%", left: "15%" }} alt="Shield 1" />
          <img src="/assests/shield-gifs/shield_02_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "30%", left: "70%" }} alt="Shield 2" />
          <img src="/assests/shield-gifs/shield_03_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "50%", left: "25%" }} alt="Shield 3" />
          <img src="/assests/shield-gifs/shield_04_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "60%", left: "75%" }} alt="Shield 4" />
          <img src="/assests/shield-gifs/shield_05_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "40%", left: "50%" }} alt="Shield 5" />
          <img src="/assests/shield-gifs/shield_06_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "70%", left: "40%" }} alt="Shield 6" />
          <img src="/assests/shield-gifs/shield_07_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "25%", left: "80%" }} alt="Shield 7" />
          <img src="/assests/shield-gifs/shield_08_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "65%", left: "10%" }} alt="Shield 8" />
          <img src="/assests/shield-gifs/shield_09_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "45%", left: "85%" }} alt="Shield 9" />
          <img src="/assests/shield-gifs/shield_10_64.gif" className="absolute w-16 pointer-events-auto" style={{ top: "35%", left: "35%" }} alt="Shield 10" />
        </div>*/}

          {/* 
          MOBILE FIX: Main buttons container
          - Desktop (md+): absolute positioning with full inset (original layout preserved)
          - Mobile (<md): flex column, centered, with proper spacing to prevent overflow
          - ClickSpark wrapper handles overflow to show animations on all screen sizes
        */}
          <ClickSpark
            sparkColor='#fff'
            sparkSize={13}
            sparkRadius={40}
            sparkCount={9}
            duration={400}
          >
            {/* 
            Container wrapper for responsive layout
            - Desktop (md+): absolute inset-0 with flex-row/items-start (original desktop behavior)
            - Mobile (<md): flex column, items-center, justify-center (mobile-optimized centered layout)
            - gap-6 on mobile for breathing room, no gap on desktop (buttons use absolute positioning)
            - p-4 on mobile for safe padding from edges, no padding on desktop
            - Overflow visible ensures ClickSpark animations show on all screens
          */}
            <div className="md:absolute md:inset-0 flex md:flex-row flex-col items-center md:items-start justify-center md:justify-start gap-6 md:gap-0 p-4 md:p-0 overflow-visible">

              {/* BUTTON 1 */}
              <button
                onClick={() => {
                  setPressed(true);
                  setTimeout(() => {
                    setPressed(false);

                    /* 
                      🔥 SCENE SWITCH:
                      - After button press animation (0.2s)
                      - Switch from "home" → "hub"
                      - This replaces the current UI with WorldHub component
                    */
                    setScene("hub");

                  }, 200); // 0.2s press effect
                }}
                className="md:absolute md:top-[42%] md:left-[42%] md:w-80 w-[60vw] pixel-btn animated-btn mt-60 md:mt-0"
              >
                <img
                  src={
                    pressed
                      ? "/panels/TextBTN_New-Start_Pressed.png"
                      : "/panels/TextBTN_New-Start.png"
                  }
                  alt="Button 1"
                />
                <span className="btn-text"></span>
              </button>

              {/* BUTTON 2 
            <button className="md:absolute md:top-[28%] md:left-[70%] md:w-80 w-[60vw] pixel-btn animated-btn">
              <img src="/panels/UI-board-small-stone.png" alt="Button 2" />
              <span className="btn-text">abc</span>
            </button>

             BUTTON 3 
            <button className="md:absolute md:top-[46%] md:left-[70%] md:w-80 w-[60vw] pixel-btn animated-btn">
              <img src="/panels/UI-board-small-stone.png" alt="Button 3" />
              <span className="btn-text">abc</span>
            </button>

            {/* BUTTON 4 
            <button className="md:absolute md:top-[64%] md:left-[70%] md:w-80 w-[60vw] pixel-btn animated-btn">
              <img src="/panels/UI-board-small-stone.png" alt="Button 4" />
              <span className="btn-text">abc</span>
            </button> */}

            </div>
          </ClickSpark>

          {/* 
          Content section
          - MOBILE FIX: Hidden on mobile to prevent overlap with buttons in flex layout
          - DESKTOP: Visible on md and above (relative z-10 to ensure visibility over video)
          - pointer-events-none: Prevents interference with button interactions on desktop
        */}
          <div className="hidden md:flex relative z-10 items-center justify-center h-full pointer-events-none">
            <h1 className="text-white">HOME PAGE</h1>
          </div>

          {/* Shutter Overlay */}
          {shutterVisible && (
            <div className="shutter-container">
              <div className="shutter-top"></div>
              <div className="shutter-bottom"></div>
            </div>
          )}
        </main>
      )}

      {/* 
      🌍 SCENE: HUB
      - Renders ONLY when scene === "hub"
      - Completely replaces home screen visually
      - WorldHub should contain your portal/world selection UI
    */}
      {scene === "hub" && (
        <WorldHub setScene={setScene} />
      )}

    </main>
  );
}