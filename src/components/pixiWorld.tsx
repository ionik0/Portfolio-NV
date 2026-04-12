"use client";

import { Container, Sprite, Assets, Application } from "pixi.js";
import { usePixi } from "@/pixi/usePixi";

export default function PixiWorld() {
  const containerRef = usePixi(async (app: Application) => {
    console.log("DEBUG: Pixi initialized");

    // ================================
    // 🌍 ROOT CONTAINER
    // ================================
    const world = new Container();
    app.stage.addChild(world);

    // ================================
    // 🎮 LOAD ASSETS
    // ================================
    const layer1Texture = await Assets.load("/assests/world-hub/layer1.png");
    const layer2Texture = await Assets.load("/assests/world-hub/layer2.png");
    const layer2Textureclone = await Assets.load("/assests/world-hub/layer2.png");
    const layer3Texture = await Assets.load("/assests/world-hub/layer3.png");

    // ================================
    // 🏝️ CREATE SPRITES
    // ================================
    const layer1 = new Sprite(layer1Texture);
    const layer3 = new Sprite(layer3Texture);
    const layer2 = new Sprite(layer2Texture);
    const layer2Clone = new Sprite(layer2Textureclone);

    layer1.anchor.set(0.5);
    layer3.anchor.set(0.5);
    layer2.anchor.set(0.5);
    layer2Clone.anchor.set(0.5);


    world.addChild(layer1);
    world.addChild(layer3);
    world.addChild(layer2);
    world.addChild(layer2Clone);

    // ================================
    // 🎛️ CONTROL PANEL (EDIT HERE)
    // ================================

    // 👉 DESIGN REFERENCE HEIGHT - Used as baseline for vertical spacing calculations
    // This ensures consistent layout across different screen heights (13" vs 16" laptops, etc.)
    const DESIGN_HEIGHT = 800;

    // 👉 SIZE CONTROL
    const size1 = 1.18;
    const size2 = 0.6;
    const size2Clone = 0.6;
    const size3 = 3.0;

    // 👉 POSITION CONTROL
    const offsetX1 = 0;
    const offsetX2 = -389;
    const offsetX2Clone = 389;
    const offsetX3 = 0;

    const offsetY1 = 0;
    const offsetY2 = 0;
    const offsetY2Clone = 0;
    const offsetY3 = 0;

    // ================================
    // 🔥 NEW: EXTRA VERTICAL CONTROL (SAFE)
    // ================================
    const moveY1 = 0;        // 🔧 MOVE LAYER 1 UP/DOWN (independent of layout)
    const moveY2 = 220;        // 🔧 MOVE LAYER 2 UP/DOWN
    const moveY2Clone = 220;   // 🔧 MOVE CLONE UP/DOWN
    const moveY3 = 150;        // 🔧 MOVE LAYER 3 UP/DOWN

    // 👉 FLOAT ANIMATION CONTROL
    const floatStrength1 = 2;
    const floatStrength2 = 3;
    const floatStrength2Clone = 3;
    const floatStrength3 = 4;

    const floatSpeed1 = 1.0;
    const floatSpeed2 = 1.3;
    const floatSpeed2Clone = 1.3;
    const floatSpeed3 = 1.6;

    // ================================
    // 🧠 INTERNAL STATE
    // ================================
    let time = 0;

    let baseY1 = 0;
    let baseY2 = 0;
    let baseY2Clone = 0;
    let baseY3 = 0;

    // 👉 HEIGHT RATIO - Stored in state so it can be accessed in both updateLayout and animation loop
    // Calculated once during layout and updated on resize
    let heightRatio = 1;

    // ================================
    // 📱 RESPONSIVE LAYOUT
    // ================================
    const updateLayout = () => {
      const screenW = app.screen.width;
      const screenH = app.screen.height;

      const baseScale = Math.min(
        screenW / layer1Texture.width,
        screenH / layer1Texture.height
      );

      const centerX = screenW / 2;
      const centerY = screenH / 2;

      // 👉 HEIGHT RATIO - Normalizes vertical layout across different screen sizes
      // Divides current screen height by design reference height to get a scaling factor
      heightRatio = screenH / DESIGN_HEIGHT;

      // ====================
      // 🏝️ LAYER 1
      // ====================
      layer1.x = centerX + offsetX1;
      // 👉 Apply heightRatio to vertical offset for consistent positioning across screen heights
      baseY1 = centerY + offsetY1 * heightRatio;
      layer1.y = baseY1;

      layer1.scale.set(baseScale * size1);

      // ====================
      // 🏝️ LAYER 2 (LEFT)
      // ====================
      layer2.x = centerX + offsetX2;
      // 👉 Apply heightRatio to vertical offset for consistent positioning across screen heights
      baseY2 = centerY + offsetY2 * heightRatio;
      layer2.y = baseY2;

      layer2.scale.set(baseScale * size2);

      // ====================
      // 🏝️ LAYER 2 CLONE (RIGHT)
      // ====================
      layer2Clone.x = centerX + offsetX2Clone;
      // 👉 Apply heightRatio to vertical offset for consistent positioning across screen heights
      baseY2Clone = centerY + offsetY2Clone * heightRatio;
      layer2Clone.y = baseY2Clone;

      layer2Clone.scale.set(baseScale * size2Clone);

      // ====================
      // 🏝️ LAYER 3
      // ====================
      layer3.x = centerX + offsetX3;
      // 👉 Apply heightRatio to vertical offset for consistent positioning across screen heights
      baseY3 = centerY + offsetY3 * heightRatio;
      layer3.y = baseY3;

      layer3.scale.set(baseScale * size3);
    };

    app.renderer.on("resize", updateLayout);
    updateLayout();

    // ================================
    // 🎞️ ANIMATION LOOP
    // ================================
    app.ticker.add((ticker) => {
      time += 0.05 * ticker.deltaTime;

      // 👉 Apply heightRatio to float strength so animation feels consistent across different screen heights
      // This prevents animation from being too large/small on different devices
      const float1 = Math.sin(time * floatSpeed1) * floatStrength1 * heightRatio;
      const float2 = Math.sin(time * floatSpeed2 + Math.PI / 2) * floatStrength2 * heightRatio;
      const float2Clone =
        Math.sin(time * floatSpeed2Clone + Math.PI / 2) * floatStrength2Clone * heightRatio;
      const float3 = Math.sin(time * floatSpeed3 + Math.PI) * floatStrength3 * heightRatio;

      // 🔥 FINAL POSITION = base + float + NEW CONTROL
      // 👉 Apply heightRatio to moveY values so manual adjustments scale consistently across screen heights
      layer1.y = baseY1 + float1 + moveY1 * heightRatio;           // 🔧 CONTROL HERE
      layer2.y = baseY2 + float2 + moveY2 * heightRatio;           // 🔧 CONTROL HERE
      layer2Clone.y = baseY2Clone + float2Clone + moveY2Clone * heightRatio; // 🔧 CONTROL HERE
      layer3.y = baseY3 + float3 + moveY3 * heightRatio;           // 🔧 CONTROL HERE
    });
  });

  return <div ref={containerRef} className="w-full h-screen" />;
}