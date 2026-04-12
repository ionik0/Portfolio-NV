import { Application } from "pixi.js";

export async function createApp(container: HTMLElement) {
    const app = new Application();
    await app.init({
        resizeTo: window,
        backgroundColor: 0x0b0b1a,
        antialias: true,
    });
    container.appendChild(app.canvas);
    return app;
}
