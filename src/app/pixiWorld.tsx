"use client";

import { Container, Sprite, Assets, Application, Rectangle } from "pixi.js"; // 🔥 Rectangle for hitArea
import { usePixi } from "@/pixi/usePixi";

export default function PixiWorld({ setScene }: { setScene: (scene: string) => void }) {
  // ❌ REMOVED useRouter → NOT needed (you are using scene-based navigation)

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

    const panelTexture = await Assets.load(
      "/freepixel-rpg-ui-kit/menu-panel-frame-stone-border-007.png"
    );

    const closeTexture = await Assets.load(
      "/freepixel-rpg-ui-kit/close-button-red-exit-icon-014.png"
    );

    const gate1Texture = await Assets.load("/gate-1/gate1.png");
    const gate2Texture = await Assets.load("/gate-1/gate2.png");
    const gate3Texture = await Assets.load("/gate-1/gate3.png");
    const gate4Texture = await Assets.load("/gate-1/gate4.png");

    // ================================
    // 🏝️ CREATE SPRITES
    // ================================
    const layer1 = new Sprite(layer1Texture);
    const panel = new Sprite(panelTexture);
    const closeBtn = new Sprite(closeTexture);

    const gate1 = new Sprite(gate1Texture);
    const gate2 = new Sprite(gate2Texture);
    const gate3 = new Sprite(gate3Texture);
    const gate4 = new Sprite(gate4Texture);

    // ================================
    // ⚙️ ANCHOR SETUP
    // ================================
    layer1.anchor.set(0.5);
    panel.anchor.set(0.5);
    closeBtn.anchor.set(0.5);

    gate1.anchor.set(0.5);
    gate2.anchor.set(0.5);
    gate3.anchor.set(0.5);
    gate4.anchor.set(0.5);

    // ================================
    // 📦 ADD TO WORLD
    // ================================
    world.addChild(layer1);
    world.addChild(panel);

    world.addChild(gate1);
    world.addChild(gate2);
    world.addChild(gate3);
    world.addChild(gate4);

    world.addChild(closeBtn); // always on top

    // ================================
    // 🔥 INITIAL VISIBILITY
    // ================================
    gate1.alpha = 1;
    gate2.alpha = 0;
    gate3.alpha = 0;
    gate4.alpha = 0;

    // ================================
    // 🎛️ CONTROL PANEL
    // ================================
    const size1 = 1.18;

    const groupScale = 0.0798676; // 🔥 MASTER SCALE
    const panelScaleMultiplier = 8.5;

    const offsetX1 = 0;
    const globalGateOffsetX = -200;

    const gateOffsetX1 = -47;
    const gateOffsetX2 = -47;
    const gateOffsetX3 = -47;
    const gateOffsetX4 = -47;

    const offsetY1 = 0;
    const globalGateOffsetY = 35;

    const gateOffsetY1 = 0;
    const gateOffsetY2 = 0;
    const gateOffsetY3 = 0;
    const gateOffsetY4 = 0;

    const panelOffsetY = -20;
    const panelOffsetX = -90;

    const moveY1 = 0;

    const gateMoveY1 = 0;
    const gateMoveY2 = 0;
    const gateMoveY3 = 0;
    const gateMoveY4 = 0;

    // ================================
    // 🧠 INTERNAL STATE
    // ================================
    let baseY1 = 0;

    let baseGateY1 = 0;
    let baseGateY2 = 0;
    let baseGateY3 = 0;
    let baseGateY4 = 0;

    let basePanelY = 0;

    let gateStep = 0;
    let zoomTime = 0;

    let isClosing = false; // 🔥 controls close animation

    // ================================
    // 📱 RESPONSIVE LAYOUT
    // ================================
    const updateLayout = () => {
      const screenW = app.screen.width;
      const screenH = app.screen.height;

      const baseScale = Math.max(
        screenW / layer1Texture.width,
        screenH / layer1Texture.height
      );

      const centerX = screenW / 2;
      const centerY = screenH / 2;

      // 🏝️ BACKGROUND
      layer1.x = centerX + offsetX1;
      baseY1 = centerY + offsetY1;
      layer1.y = baseY1;
      layer1.scale.set(baseScale * size1);

      // 🚪 GATES
      gate1.x = centerX + globalGateOffsetX + gateOffsetX1;
      baseGateY1 = centerY + globalGateOffsetY + gateOffsetY1;
      gate1.y = baseGateY1;

      gate2.x = centerX + globalGateOffsetX + gateOffsetX2;
      baseGateY2 = centerY + globalGateOffsetY + gateOffsetY2;
      gate2.y = baseGateY2;

      gate3.x = centerX + globalGateOffsetX + gateOffsetX3;
      baseGateY3 = centerY + globalGateOffsetY + gateOffsetY3;
      gate3.y = baseGateY3;

      gate4.x = centerX + globalGateOffsetX + gateOffsetX4;
      baseGateY4 = centerY + globalGateOffsetY + gateOffsetY4;
      gate4.y = baseGateY4;

      // 🪟 PANEL
      panel.x = centerX + globalGateOffsetX + panelOffsetX;
      basePanelY = centerY + panelOffsetY;
      panel.y = basePanelY;

      // 🔥 SCALE APPLY
      const finalGateScale = baseScale * groupScale;
      const finalPanelScale = finalGateScale * panelScaleMultiplier;

      gate1.scale.set(finalGateScale);
      gate2.scale.set(finalGateScale);
      gate3.scale.set(finalGateScale);
      gate4.scale.set(finalGateScale);

      panel.scale.set(finalPanelScale);

      // 🔥 FIX CLICK AREA (restrict inside panel)
      gate1.hitArea = new Rectangle(
        -panel.width / 2,
        -panel.height / 2,
        panel.width,
        panel.height
      );

      // 🔥 CLOSE BUTTON POSITION
      closeBtn.x = screenW - 80;
      closeBtn.y = screenH - 80;
      closeBtn.scale.set(0.5);
    };

    app.renderer.on("resize", updateLayout);
    updateLayout();

    // ================================
    // 🖱️ INTERACTION
    // ================================
    gate1.eventMode = "static";
    gate1.cursor = "pointer";

    gate1.on("pointerdown", () => {
      gateStep = 1;
    });

    closeBtn.eventMode = "static";
    closeBtn.cursor = "pointer";

    closeBtn.on("pointerdown", () => {
      isClosing = true;
    });

    // ================================
    // 🎞️ ANIMATION LOOP
    // ================================
    app.ticker.add((ticker) => {
      zoomTime += 0.025 * ticker.deltaTime;

      const zoom = 1 + Math.sin(zoomTime) * 0.001;

      const zoomedGateScale = gate1.scale.x * zoom;
      const zoomedPanelScale = panel.scale.x * zoom;

      panel.scale.set(zoomedPanelScale);

      if (gateStep === 0) {
        gate1.scale.set(zoomedGateScale);
      }

      // 🔥 GATE OPENING SEQUENCE
      if (gateStep === 1) {
        gate2.alpha += 0.025;
        if (gate2.alpha >= 1) gateStep = 2;
      }

      if (gateStep === 2) {
        gate3.alpha += 0.025;
        if (gate3.alpha >= 1) gateStep = 3;
      }

      if (gateStep === 3) {
        gate4.alpha += 0.025;
        if (gate4.alpha >= 1) gateStep = 4;
      }

      // 🔥 CLOSE BUTTON → RETURN TO HOME (REAL FIX)
      if (isClosing) {
        closeBtn.rotation += 0.2;

        if (closeBtn.rotation >= Math.PI) {
          closeBtn.rotation = 0;
          isClosing = false;

          // ✅ THIS is your actual navigation system
          setScene("home");

          // reset state
          gateStep = 0;
          gate2.alpha = 0;
          gate3.alpha = 0;
          gate4.alpha = 0;
        }
      }

      // 👉 FINAL POSITION
      layer1.y = baseY1 + moveY1;

      gate1.y = baseGateY1 + gateMoveY1;
      gate2.y = baseGateY2 + gateMoveY2;
      gate3.y = baseGateY3 + gateMoveY3;
      gate4.y = baseGateY4 + gateMoveY4;

      panel.y = basePanelY;
    });
  });

  return <div ref={containerRef} className="w-full h-screen" />;
}