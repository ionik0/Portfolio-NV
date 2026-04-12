"use client";

import { useState, useTransition, useEffect } from "react";
import HubLoadingScreen from "@/components/loader/hub-loading-screen";
import ClickSpark from "@/components/ClickSpark"; // ✅ FIXED import
import PixiWorld from "@/components/pixiWorld";

type Props = {
  setScene: (scene: string) => void;
};

export default function WorldHub({ setScene }: Props) {

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

  return (
    <main className="w-full">

      {/* 🔥 HUB LOADING */}
      {loading && <HubLoadingScreen onFinish={handleLoadingFinish} />}

      {/* 🔥 MAIN HUB CONTENT (NO scene === "home" here) */}
      {!loading && shutterOpen && (
        <main className="relative h-screen w-full overflow-hidden">


          {/* Overlay (optional) */}
          {/* <div className="absolute inset-0 bg-black/50"></div> */}

          {/* 🔥 INTERACTIVE LAYER */}
          <ClickSpark
            sparkColor="#fff"
            sparkSize={13}
            sparkRadius={40}
            sparkCount={9}
            duration={400}
          >
            <div className="absolute inset-0">
              {/* DEBUG START */}
              {/* Temporary mount to verify Pixi is rendering */}
              <div className="absolute inset-0 z-10">
                <PixiWorld />
              </div>
              {/* DEBUG END */}

            </div>
          </ClickSpark>

          {/* 🔥 SHUTTER */}
          {shutterVisible && (
            <div className="shutter-container">
              <div className="shutter-top"></div>
              <div className="shutter-bottom"></div>
            </div>
          )}

        </main>
      )}

    </main>
  );
}