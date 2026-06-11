-# Pixi.js in This Project

A beginner's guide to what we've built.

## What Has Been Implemented

### 1. Pixi App Setup
The Pixi Application is created in `/src/pixi/createApp.ts`:
```ts
const app = new Application();
await app.init({
  resizeTo: window,  // Auto-resize canvas to window
  backgroundColor: 0x0b0b1a,
  antialias: true,
});
```
- `resizeTo: window` makes the canvas fill the browser window

### 2. Asset Loading
Images are loaded in `/src/components/pixiWorld.tsx`:
```ts
const islandTex = await Assets.load("/assests/world-hub/island.png");
const towerTex = await Assets.load("/assests/world-hub/tower.png");
```
- Each image is loaded individually (Pixi v8 style)

### 3. Rendering Flow
1. React renders `PixiWorld` component
2. `usePixi` hook creates the Pixi app
3. Assets load
4. Sprites added to stage
5. Ticker updates animation

## How Responsiveness Works

### What `resizeTo: window` Does
- Canvas automatically resizes to window dimensions
- `app.screen` returns new width/height on resize

### Why Sprites Don't Auto-Scale
- Canvas resizing doesn't change sprite positions or sizes
- Sprites keep their original properties

### Why We Handle Resize Manually
We listen to the renderer's "resize" event and call `updateLayout()`:
```ts
app.renderer.on("resize", updateLayout);

const updateLayout = () => {
  const scale = Math.min(screenW, screenH) * 0.4 / textureSize;
  island.x = screenW / 2;
  island.y = screenH / 2;
  island.scale.set(scale);
};
```

## Key Concepts

### Stage
- The root container for all sprites
- Like an HTML document's `<body>`
- Access via: `app.stage`

### Sprite
- A 2D image displayed on screen
- Can move, scale, rotate
- Created from a texture

### Texture
- The image data loaded from file
- Can be reused by multiple sprites
- Loaded via: `Assets.load("path")`

### Renderer
- Draws everything to the canvas
- Handles resizing
- Access via: `app.renderer`

### Screen vs World
- **Screen**: The browser window (`app.screen`)
- **World**: Our game scene (sprites in a container)

## Code Snippets

### Creating Pixi App
```ts
import { Application } from "pixi.js";
const app = new Application();
await app.init({ resizeTo: window });
```

### Loading Assets
```ts
import { Assets } from "pixi.js";
const texture = await Assets.load("/path/image.png");
```

### Scaling Sprites
```ts
const scale = Math.min(width, height) * 0.4 / textureSize;
sprite.scale.set(scale);
sprite.x = width / 2;  // Center
sprite.y = height / 2;
```

### Resize Handler
```ts
app.renderer.on("resize", () => {
  // Update sprite positions
});
```

## What to Learn Next

- **Camera System**: Pan/zoom the world view
- **Movement**: Animate sprites with velocity
- **Zoom**: Scale the entire world container
- **Parallax**: Layer background at different speeds