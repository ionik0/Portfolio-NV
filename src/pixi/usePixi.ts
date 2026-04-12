"use client";

import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { createApp } from "./createApp";

export function usePixi(
    setup: (app: Application) => Promise<void> | void
) {
    // DEBUG START
    console.log("DEBUG: usePixi hook running");
    // DEBUG END

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let app: Application | null = null;

        const init = async () => {
            if (!containerRef.current) return;

            // DEBUG START
            console.log("DEBUG: Pixi setup function running");
            // DEBUG END

            app = await createApp(containerRef.current);

            // DEBUG START
            console.log("DEBUG: Pixi app created", app);
            // DEBUG END

            // run your scene logic
            await setup(app);

            // DEBUG START
            console.log("DEBUG: Canvas appended to container");
            // DEBUG END
        };

        init();
        return () => {
            // ✅ clean destroy (IMPORTANT)
            if (app) {
                app.destroy(true);
            }
        };
    }, [setup]);

    return containerRef;
}