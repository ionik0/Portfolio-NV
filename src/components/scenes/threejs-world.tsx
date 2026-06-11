"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import HubLoadingScreen from "@/components/loader/hub-loading-screen";

// ==================================================
// CAMERA CONSTANTS
// ==================================================

const INITIAL_CAMERA_X = 13.72;
const INITIAL_CAMERA_Y = 6.88;
const INITIAL_CAMERA_Z = -21.27;

// ==================================================
// WAYPOINTS
// freeOrbit: true  → user can orbit freely (O and D)
// freeOrbit: false → camera is locked to waypoint target
// pauseAnimation: true → mixer freezes at POINT_C_FREEZE_TIME
// ==================================================

const WAYPOINTS = [
    {
        cam: { x: 13.72, y: 6.88, z: -21.27 },
        target: { x: -30.36, y: 6.50, z: 19.12 },
        label: "Welcome",
        pauseAnimation: false,
        freeOrbit: true,   // Point O — free look
    },
    {
        cam: { x: -2.97, y: 6.17, z: 26.37 },
        target: { x: 11.85, y: -0.52, z: 10.17 },
        label: "About Me",
        pauseAnimation: false,
        freeOrbit: false,
    },
    {
        cam: { x: -7.07, y: 5.85, z: 27.32 },
        target: { x: 0.59, y: 7.35, z: 27.85 },
        label: "Project Tree",
        pauseAnimation: false,
        freeOrbit: false,
    },
    {
        cam: { x: -1.92, y: 9.75, z: -0.96 },
        target: { x: -9.61, y: 4.10, z: 1.78 },
        label: "Contact",
        pauseAnimation: true,
        freeOrbit: false,
    },
    {
        cam: { x: -3.73, y: 3.67, z: -15.88 },
        target: { x: -5.96, y: 5.33, z: -0.10 },
        label: "Thank You",
        pauseAnimation: false,
        freeOrbit: true,   // Point D — free look
    },
];

// ==================================================
// SCROLL / SWIPE SETTINGS
// ==================================================

const LERP_SPEED = 0.08;
const ARRIVE_THRESHOLD = 0.15;
const SCROLL_COOLDOWN_MS = 1200;
const SWIPE_THRESHOLD_PX = 50;   // minimum px to register swipe

// ==================================================
// POINT C FREEZE TIME (seconds)
// Use the Freeze Time debug button to find this value.
// ==================================================

const POINT_C_FREEZE_TIME = 0.812;

// ==================================================
// CONTACT LINKS
// ==================================================

const CONTACT_LINKEDIN = "https://linkedin.com/in/mvnnik/";
const CONTACT_EMAIL = "mailto:npxnikhilkumar@gmail.com";
const CONTACT_GITHUB = "https://github.com/ionik0";

// ==================================================
// PROJECTS  (from resume)
// ==================================================

const PROJECTS = [
    {
        name: "OpenSource Galaxy",
        tech: "Next.js · Three.js · Spring Boot · GitHub API",
        desc: "Interactive 3D ecosystem explorer visualising open-source repo relationships and dependencies.",
        link: "https://github.com/ionik0/OpenSource-galaxy",
    },
    {
        name: "Quantum Secure Messaging",
        tech: "Python · Qiskit · Quantum Computing",
        desc: "Quantum communication simulation using teleportation, Bell-state circuits, and adversarial attack analysis. Research paper published on Zenodo.",
        link: "https://github.com/ionik0/quantum-secure-messaging",
    },
    {
        name: "AI Orchestrator",
        tech: "TypeScript · Node.js · VS Code Extension API",
        desc: "Multi-agent AI orchestration platform as a VS Code extension with Planner-Coder-Reviewer workflow and real-time streaming execution.",
        link: "https://github.com/ionik0/ai-orchestrator-extension",
    },
];

// ==================================================
// SKILLS  (from resume)
// ==================================================

const SKILLS = [
    "Java", "Spring Boot", "JavaScript", "TypeScript",
    "Node.js", "React", "Next.js", "Three.js",
    "REST APIs", "Microservices", "Python", "Qiskit",
    "Git", "AWS", "SQL", "System Design",
];

// ==================================================
// CLICKSPARK CONFIG
// ==================================================

const SPARK_COUNT = 10;
const SPARK_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fef3c7", "#e879f9", "#ffffff"];

type Spark = { id: number; x: number; y: number; angle: number; color: string; };

// ==================================================
// HINT KEY — used in sessionStorage so the nav hint
// shows once per browser session, not every page load.
// ==================================================

const NAV_HINT_KEY = "portfolio_nav_hint_seen";

type Props = { setScene: (scene: string) => void; };

export default function ThreejsWorld({ setScene }: Props) {

    // ==================================================
    // REFS
    // ==================================================

    const containerRef = useRef<HTMLDivElement>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const actionsRef = useRef<THREE.AnimationAction[]>([]);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelLoadedRef = useRef(false);
    const isAnimatingRef = useRef(true);

    // Scroll / swipe navigation
    const currentIndexRef = useRef(0);
    const scrollLockedRef = useRef(false);
    const cameraTargetRef = useRef(new THREE.Vector3(INITIAL_CAMERA_X, INITIAL_CAMERA_Y, INITIAL_CAMERA_Z));
    const orbitTargetRef = useRef(new THREE.Vector3(WAYPOINTS[0].target.x, WAYPOINTS[0].target.y, WAYPOINTS[0].target.z));

    // Touch tracking for swipe detection
    const touchStartYRef = useRef<number | null>(null);

    // ==================================================
    // UI STATE
    // ==================================================

    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentLabel, setCurrentLabel] = useState(WAYPOINTS[0].label);
    const [panelVisible, setPanelVisible] = useState(true);
    const [panelLeaving, setPanelLeaving] = useState(false);
    const [showNavHint, setShowNavHint] = useState(false);
    const [sparks, setSparks] = useState<Spark[]>([]);
    const sparkIdRef = useRef(0);

    // Show nav hint once per session
    useEffect(() => {
        if (typeof window !== "undefined") {
            const seen = sessionStorage.getItem(NAV_HINT_KEY);
            if (!seen) setShowNavHint(true);
        }
    }, []);

    // ==================================================
    // CLICK SPARK
    // ==================================================

    const handleCanvasInteraction = useCallback((clientX: number, clientY: number) => {
        const newSparks: Spark[] = Array.from({ length: SPARK_COUNT }, (_, i) => ({
            id: ++sparkIdRef.current,
            x: clientX,
            y: clientY,
            angle: (360 / SPARK_COUNT) * i,
            color: SPARK_COLORS[i % SPARK_COLORS.length],
        }));
        setSparks((prev) => [...prev, ...newSparks]);
        const ids = newSparks.map((s) => s.id);
        setTimeout(() => setSparks((prev) => prev.filter((s) => !ids.includes(s.id))), 700);
    }, []);

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        handleCanvasInteraction(e.clientX, e.clientY);
    }, [handleCanvasInteraction]);

    // ==================================================
    // NAVIGATE TO INDEX
    // ==================================================

    const navigateTo = useCallback((nextIndex: number) => {
        if (scrollLockedRef.current) return;
        if (nextIndex === currentIndexRef.current) return;
        if (nextIndex < 0 || nextIndex >= WAYPOINTS.length) return;

        currentIndexRef.current = nextIndex;
        const wp = WAYPOINTS[nextIndex];

        cameraTargetRef.current.set(wp.cam.x, wp.cam.y, wp.cam.z);
        orbitTargetRef.current.set(wp.target.x, wp.target.y, wp.target.z);

        setCurrentIndex(nextIndex);
        setCurrentLabel(wp.label);
        setPanelLeaving(false);
        setPanelVisible(true);

        // Dismiss nav hint after first navigation
        if (showNavHint) {
            setShowNavHint(false);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(NAV_HINT_KEY, "1");
            }
        }

        // Update OrbitControls free/locked state immediately
        if (controlsRef.current) {
            controlsRef.current.enableRotate = true; // always allow look
            // For non-free points, we still allow rotate but
            // the target is continuously lerped — see animate loop.
        }

        // Animation pause / seek for Point C
        if (wp.pauseAnimation) {
            if (mixerRef.current && actionsRef.current.length > 0) {
                actionsRef.current.forEach((action) => {
                    const duration = action.getClip().duration;
                    const seekTime = POINT_C_FREEZE_TIME % duration;
                    action.time = seekTime;
                    action.paused = false;
                    mixerRef.current!.update(0);
                    action.paused = true;
                });
            }
            isAnimatingRef.current = false;
        } else {
            actionsRef.current.forEach((action) => {
                action.paused = false;
                if (!action.isRunning()) action.play();
            });
            isAnimatingRef.current = true;
        }

        scrollLockedRef.current = true;
        setTimeout(() => { scrollLockedRef.current = false; }, SCROLL_COOLDOWN_MS);

    }, [showNavHint]);

    // ==================================================
    // CLOSE PANEL
    // ==================================================

    const closePanel = useCallback(() => {
        setPanelLeaving(true);
        setTimeout(() => { setPanelVisible(false); setPanelLeaving(false); }, 450);
    }, []);

    // ==================================================
    // MAIN THREE.JS EFFECT
    // ==================================================

    useEffect(() => {
        if (!containerRef.current) return;

        // ── Scene ────────────────────────────────────
        const scene = new THREE.Scene();

        // Video background
        const video = document.createElement("video");
        video.src = "/videos/world-hub-bg.mp4";
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.play().catch(() => console.warn("Video autoplay blocked."));

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = videoTexture;

        // ── Camera ───────────────────────────────────
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1, 1000
        );
        camera.position.set(INITIAL_CAMERA_X, INITIAL_CAMERA_Y, INITIAL_CAMERA_Z);

        // ── Renderer ─────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const clock = new THREE.Clock();

        // ── Lighting ─────────────────────────────────
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        // ── Model Loader ─────────────────────────────
        const loadModel = async () => {
            if (modelLoadedRef.current) return;
            modelLoadedRef.current = true;

            try {
                const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
                const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
                const loader = new GLTFLoader();

                loader.load(
                    "/models/mobile_home.glb",
                    (gltf) => {
                        const model = gltf.scene;
                        model.scale.set(0.5, 0.5, 0.5);
                        model.position.set(0, 0, 0);
                        scene.add(model);

                        const controls = new OrbitControls(camera, renderer.domElement);
                        controls.enableDamping = true;
                        controls.dampingFactor = 0.05;
                        controls.enableZoom = false; // scroll reserved for waypoints
                        controls.enableRotate = true;  // free look always on
                        controls.target.set(WAYPOINTS[0].target.x, WAYPOINTS[0].target.y, WAYPOINTS[0].target.z);
                        controlsRef.current = controls;

                        if (gltf.animations.length > 0) {
                            const mixer = new THREE.AnimationMixer(model);
                            mixerRef.current = mixer;
                            gltf.animations.forEach((clip) => {
                                const action = mixer.clipAction(clip);
                                action.play();
                                actionsRef.current.push(action);
                            });
                        }

                        // Model ready — hide loading screen
                        setIsLoading(false);
                    },
                    undefined,
                    (err) => {
                        console.error("Model load error:", err);
                        setIsLoading(false); // hide loader even on error
                    }
                );
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        loadModel();

        // ── Scroll handler ───────────────────────────
        // Scroll UP (deltaY < 0) = forward = next point
        // Scroll DOWN (deltaY > 0) = back = prev point
        const handleWheel = (e: WheelEvent) => {
            if (scrollLockedRef.current) return;
            const dir = e.deltaY < 0 ? 1 : -1;
            navigateTo(currentIndexRef.current + dir);
        };
        window.addEventListener("wheel", handleWheel, { passive: true });

        // ── Touch / swipe handler ────────────────────
        const handleTouchStart = (e: TouchEvent) => {
            touchStartYRef.current = e.touches[0].clientY;
        };
        const handleTouchEnd = (e: TouchEvent) => {
            if (touchStartYRef.current === null) return;
            const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
            if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
            // Swipe UP (deltaY > 0) = scroll forward = next point
            const dir = deltaY > 0 ? 1 : -1;
            navigateTo(currentIndexRef.current + dir);
            touchStartYRef.current = null;
        };
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });

        // ── Animation loop ───────────────────────────
        const animate = () => {
            requestAnimationFrame(animate);

            const wp = WAYPOINTS[currentIndexRef.current];

            if (controlsRef.current) {
                // Always lerp camera position toward waypoint
                const isFreeOrbitPoint = wp.freeOrbit;

                if (!isFreeOrbitPoint || scrollLockedRef.current) {
                    camera.position.lerp(cameraTargetRef.current, LERP_SPEED);

                    if (
                        camera.position.distanceTo(cameraTargetRef.current) <
                        ARRIVE_THRESHOLD
                    ) {
                        camera.position.copy(cameraTargetRef.current);
                    }
                }
                if (camera.position.distanceTo(cameraTargetRef.current) < ARRIVE_THRESHOLD) {
                    camera.position.copy(cameraTargetRef.current);
                }

                // For non-freeOrbit points: also lerp the orbit target
                // so the camera snaps to the intended look direction.
                // For freeOrbit points: leave controls.target alone
                // so the user can orbit freely.
                if (!wp.freeOrbit) {
                    controlsRef.current.target.lerp(orbitTargetRef.current, LERP_SPEED);
                    if (controlsRef.current.target.distanceTo(orbitTargetRef.current) < ARRIVE_THRESHOLD) {
                        controlsRef.current.target.copy(orbitTargetRef.current);
                    }
                }

                controlsRef.current.update();
            }

            if (mixerRef.current && isAnimatingRef.current) {
                mixerRef.current.update(clock.getDelta());
            }

            renderer.render(scene, camera);
        };

        animate();

        // ── Resize ───────────────────────────────────
        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            video.pause();
            renderer.dispose();
        };

    }, [navigateTo]);

    // ==================================================
    // MOBILE NAV BUTTONS
    // ==================================================

    const handlePrev = () => navigateTo(currentIndex - 1);
    const handleNext = () => navigateTo(currentIndex + 1);

    // ==================================================
    // PANEL CLOSE
    // ==================================================

    const CloseBtn = () => (
        <button
            onClick={closePanel}
            aria-label="Close"
            className="
                absolute top-4 right-4 w-9 h-9 rounded-full z-10
                flex items-center justify-center
                bg-white/10 hover:bg-orange-500/40
                border border-white/15 hover:border-orange-400/60
                text-white/60 hover:text-white text-base
                transition-all duration-300
                hover:rotate-90 hover:scale-110 active:scale-95
            "
        >✕</button>
    );

    // ==================================================
    // PANEL O — WELCOME
    // ==================================================

    const PanelWelcome = () => (
        <div className="relative flex flex-col items-center gap-5 pt-2 pb-1">
            <CloseBtn />

            {/* Animated orb */}
            <div className="relative w-24 h-24 mt-2">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 opacity-40 blur-xl animate-pulse" />
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 opacity-70 blur-md animate-pulse" style={{ animationDelay: "0.3s" }} />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-4xl" style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.8))" }}>✦</span>
                </div>
                {/* Orbiting ring */}
                <div className="absolute inset-[-8px] rounded-full border border-orange-400/30 animate-spin" style={{ animationDuration: "8s" }} />
            </div>

            <div className="text-center">
                <p className="text-orange-400/80 text-xs tracking-[0.25em] uppercase mb-1">Welcome to</p>
                <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                    Nikhil&apos;s Mobile House
                </h1>
                <p className="text-white/50 text-sm mt-1">Software Engineer · Builder · Explorer</p>
            </div>

            <p className="text-white/60 text-sm text-center leading-relaxed max-w-xs">
                An interactive 3D portfolio... explore floating islands to discover my projects,
                skills, and story. Each scroll takes you somewhere new.
            </p>

            <div className="flex gap-2 items-center">
                {WAYPOINTS.map((_, i) => (
                    <div
                        key={i}
                        className={`rounded-full transition-all duration-300 ${i === 0 ? "w-4 h-2 bg-orange-400" : "w-2 h-2 bg-white/20"}`}
                    />
                ))}
            </div>

            <p className="text-white/30 text-xs tracking-widest animate-bounce">↑ scroll or swipe to begin</p>
        </div>
    );

    // ==================================================
    // PANEL A — ABOUT ME
    // ==================================================

    const PanelAbout = () => (
        <div className="relative flex flex-col gap-4 pt-2">
            <CloseBtn />

            <div className="flex items-center gap-3 pr-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-orange-500/30 flex-shrink-0">
                    Nik
                </div>
                <div>
                    <h2 className="text-xl font-bold text-amber-200">Nikhil Kumar</h2>
                    <p className="text-white/50 text-xs">Software Engineering Student · Jaipur, Rajasthan</p>
                </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed border-l-2 border-orange-500/40 pl-3">
                Software Engineering student skilled in backend systems, distributed architectures,
                and interactive 3D experiences. Open-source contributor at Apache Superset with a
                strong interest in Quantum Computing and secure communications (QKD).
            </p>

            <div>
                <p className="text-orange-400/80 text-xs tracking-widest uppercase mb-2">Education</p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white text-sm font-medium">B.Tech (Computer Science)</p>
                    <p className="text-white/50 text-xs mt-0.5">ACEIT · RTU · CGPA 8.3</p>
                    <p className="text-white/30 text-xs">2025 - 2029</p>
                </div>
            </div>

            <div>
                <p className="text-orange-400/80 text-xs tracking-widest uppercase mb-2">Open Source</p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-start gap-2">
                    <span className="text-orange-400 text-lg mt-0.5">⊹</span>
                    <div>
                        <p className="text-white text-sm font-medium">Apache Superset Contributor</p>
                        <p className="text-white/50 text-xs leading-relaxed mt-0.5">
                            Added Grid View & List View tooltips to the ListView interface.
                            PR reviewed and merged by Superset maintainers.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-orange-400/80 text-xs tracking-widest uppercase mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                    {SKILLS.map((skill) => (
                        <span
                            key={skill}
                            className="px-2 py-0.5 rounded-full text-xs bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/30 transition-colors cursor-default"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    // ==================================================
    // PANEL B — PROJECT TREE
    // ==================================================

    const PanelProjects = () => (
        <div className="relative flex flex-col gap-4 pt-2">
            <CloseBtn />

            <div className="pr-10">
                <h2 className="text-xl font-bold text-amber-200">Project Tree</h2>
                <p className="text-white/40 text-xs mt-0.5">Scroll within this panel to explore</p>
            </div>

            <div
                className="overflow-y-auto flex flex-col gap-3 pr-1 max-h-72"
                onWheel={(e) => e.stopPropagation()} // prevent page scroll while scrolling projects
            >
                {PROJECTS.map((project, i) => (
                    <a
                        key={i}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            block p-4 rounded-xl
                            bg-white/5 hover:bg-white/10
                            border border-white/10 hover:border-orange-400/40
                            transition-all duration-200 group
                        "
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-orange-400 text-lg">◈</span>
                                <p className="text-white text-sm font-semibold group-hover:text-amber-300 transition-colors">
                                    {project.name}
                                </p>
                            </div>
                            <span className="text-white/20 group-hover:text-orange-400 transition-colors text-sm mt-0.5 flex-shrink-0">↗</span>
                        </div>
                        <p className="text-white/55 text-xs mt-2 leading-relaxed ml-6">{project.desc}</p>
                        <div className="flex flex-wrap gap-1 mt-2 ml-6">
                            {project.tech.split(" · ").map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/40 border border-white/10">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );

    // ==================================================
    // PANEL C — CONTACT
    // ==================================================

    const PanelContact = () => (
        <div className="relative flex flex-col gap-5 pt-2">
            <CloseBtn />

            <div className="pr-10">
                <h2 className="text-xl font-bold text-amber-200">Let&apos;s Connect</h2>
                <p className="text-white/50 text-sm mt-1">
                    Open to internships, collaborations, and interesting engineering problems.
                </p>
            </div>

            {/* Availability badge */}
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-green-300 text-xs">Available for Software Engineering Internships</p>
            </div>

            <div className="flex flex-col gap-3">
                <a
                    href={CONTACT_LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0077b5]/15 hover:bg-[#0077b5]/35 border border-[#0077b5]/35 hover:border-[#0077b5]/70 text-white text-sm font-medium transition-all duration-200 group"
                >
                    <div className="w-9 h-9 rounded-lg bg-[#0077b5]/30 flex items-center justify-center text-[#0077b5] font-bold text-base flex-shrink-0">in</div>
                    <div>
                        <p className="text-white text-sm font-medium">LinkedIn</p>
                        <p className="text-white/40 text-xs">linkedin.com/in/mvnnik</p>
                    </div>
                    <span className="ml-auto text-white/25 group-hover:text-white transition-colors">→</span>
                </a>

                <a
                    href={CONTACT_EMAIL}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/25 hover:border-orange-400/60 text-white text-sm font-medium transition-all duration-200 group"
                >
                    <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-base flex-shrink-0">✉</div>
                    <div>
                        <p className="text-white text-sm font-medium">Email</p>
                        <p className="text-white/40 text-xs">npxnikhilkumar@gmail.com</p>
                    </div>
                    <span className="ml-auto text-white/25 group-hover:text-white transition-colors">→</span>
                </a>

                <a
                    href={CONTACT_GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/15 hover:border-white/40 text-white text-sm font-medium transition-all duration-200 group"
                >
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white text-base flex-shrink-0">⌥</div>
                    <div>
                        <p className="text-white text-sm font-medium">GitHub</p>
                        <p className="text-white/40 text-xs">github.com/mvnnik</p>
                    </div>
                    <span className="ml-auto text-white/25 group-hover:text-white transition-colors">→</span>
                </a>
            </div>

            <p className="text-white/25 text-xs text-center">
                📍 Jaipur, Rajasthan · Open to remote & relocation
            </p>
        </div>
    );

    // ==================================================
    // PANEL D — THANK YOU
    // ==================================================

    const PanelThanks = () => (
        <div className="relative flex flex-col items-center gap-5 pt-2 pb-1">
            <CloseBtn />

            {/* Animated starburst */}
            <div className="relative w-28 h-28 flex items-center justify-center mt-2">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: "3px",
                            height: i % 2 === 0 ? "28px" : "18px",
                            background: `hsl(${30 + i * 10}, 90%, 65%)`,
                            transform: `rotate(${i * 30}deg) translateY(${i % 2 === 0 ? "-24px" : "-20px"})`,
                            animation: `pulseRay 2s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                            opacity: 0.8,
                        }}
                    />
                ))}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/40 z-10">
                    <span className="text-3xl">✦</span>
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
                    Thank You
                </h2>
                <p className="text-white/50 text-sm mt-1">for visiting my world</p>
            </div>

            <p className="text-white/65 text-sm text-center leading-relaxed max-w-xs">
                I hope you enjoyed exploring this 3D portfolio.
                Building it was as fun as building the projects inside it.
            </p>

            <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-white/40 text-xs mb-2">Want to work together?</p>
                <a
                    href={CONTACT_EMAIL}
                    className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                >
                    npxnikhilkumar@gmail.com ↗
                </a>
            </div>

            <button
                onClick={() => navigateTo(0)}
                className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
                ↩ Back to the beginning
            </button>
        </div>
    );

    // Panel map
    const PANELS = [PanelWelcome, PanelAbout, PanelProjects, PanelContact, PanelThanks];
    const ActivePanel = PANELS[currentIndex];

    // ==================================================
    // UI
    // ==================================================

    return (
        <div className="relative w-full h-screen overflow-hidden select-none">

            {/* Loading screen — sits above everything until model ready */}
            {isLoading && (
                <div className="absolute inset-0 z-50">
                    <HubLoadingScreen />
                </div>
            )}

            {/* Three.js canvas */}
            <div
                ref={containerRef}
                className="w-full h-full"
                onClick={handleCanvasClick}
            />

            {/* ClickSpark particles */}
            {sparks.map((spark) => (
                <div
                    key={spark.id}
                    className="pointer-events-none fixed z-50"
                    style={{ left: spark.x, top: spark.y }}
                >
                    <div
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            background: spark.color,
                            animation: "sparkFly 0.7s ease-out forwards",
                            "--angle": `${spark.angle}deg`,
                        } as React.CSSProperties}
                    />
                </div>
            ))}

            {/* Keyframe styles */}
            <style>{`
                @keyframes sparkFly {
                    0%   { transform: rotate(var(--angle)) translateY(0px)  scale(1);   opacity: 1; }
                    60%  { opacity: 0.8; }
                    100% { transform: rotate(var(--angle)) translateY(48px) scale(0.4); opacity: 0; }
                }
                @keyframes panelIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); filter: blur(4px); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);   filter: blur(0);   }
                }
                @keyframes panelOut {
                    from { opacity: 1; transform: translateY(0)      scale(1);    filter: blur(0);   }
                    to   { opacity: 0; transform: translateY(-16px)  scale(0.95); filter: blur(6px); }
                }
                @keyframes panelJitter {
                    0%,100% { transform: translateX(0) scale(1); }
                    15%     { transform: translateX(-6px) scale(0.99); }
                    30%     { transform: translateX(5px)  scale(1.01); }
                    45%     { transform: translateX(-4px) scale(0.99); }
                    60%     { transform: translateX(4px); }
                    80%     { transform: translateX(-2px); }
                }
                @keyframes pulseRay {
                    0%,100% { opacity: 0.6; transform: rotate(var(--r)) translateY(var(--ty)) scaleY(1);   }
                    50%     { opacity: 1;   transform: rotate(var(--r)) translateY(var(--ty)) scaleY(1.2); }
                }
                @keyframes hintFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0);   }
                }
            `}</style>

            {/* ── Back button ── */}
            <button
                onClick={() => setScene("home")}
                className="
                    absolute top-4 left-4 z-20
                    bg-black/35 hover:bg-black/55
                    backdrop-blur-sm
                    border border-white/10 hover:border-white/25
                    px-3 py-1.5 rounded-lg
                    text-white/65 hover:text-white text-sm
                    transition-all duration-200
                "
            >
                ← Back
            </button>

            {/* ── Floating Panel ── */}
            {!isLoading && panelVisible && ActivePanel && (
                <div
                    className="
                        absolute top-1/2 right-5 -translate-y-1/2
                        w-[min(380px,88vw)]
                        bg-black/45 backdrop-blur-2xl
                        border border-white/10
                        rounded-2xl p-6 z-30 text-white
                        shadow-2xl shadow-black/50
                    "
                    style={{
                        animation: panelLeaving
                            ? (currentIndex === 1
                                ? "panelJitter 0.45s ease, panelOut 0.45s ease forwards"
                                : "panelOut 0.45s ease forwards")
                            : "panelIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
                    }}
                >
                    <ActivePanel />
                </div>
            )}

            {/* ── Waypoint HUD ── */}
            {!isLoading && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">

                    {/* Progress dots */}
                    <div className="flex gap-2 items-center">
                        {WAYPOINTS.map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-500 ${i === currentIndex
                                    ? "w-5 h-2 bg-orange-400"
                                    : i < currentIndex
                                        ? "w-2 h-2 bg-orange-400/40"
                                        : "w-2 h-2 bg-white/20"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/10">
                        <p className="text-white/60 text-xs tracking-widest uppercase">{currentLabel}</p>
                    </div>
                </div>
            )}

            {/* ── One-time navigation hint ── */}
            {!isLoading && showNavHint && (
                <div
                    className="
                        absolute bottom-24 left-1/2 -translate-x-1/2
                        z-20 pointer-events-none
                        bg-black/50 backdrop-blur-sm
                        border border-white/15 rounded-2xl
                        px-5 py-3 text-center
                    "
                    style={{ animation: "hintFadeIn 0.6s ease forwards" }}
                >
                    <p className="text-white/70 text-xs font-medium mb-1">How to explore</p>
                    <p className="text-white/40 text-xs">
                        <span className="text-white/60">PC</span> — scroll up / down &nbsp;·&nbsp;
                        <span className="text-white/60">Mobile</span> — swipe up / down
                    </p>
                    <p className="text-white/30 text-xs mt-1">Hold & drag to look around freely</p>
                </div>
            )}

            {/* ── Mobile nav buttons ── */}
            {!isLoading && (
                <>
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        aria-label="Previous"
                        className="
                            absolute left-3 top-1/2 -translate-y-1/2 z-20
                            w-10 h-10 rounded-full
                            bg-black/20 hover:bg-black/45 backdrop-blur-sm
                            border border-white/10 hover:border-white/25
                            text-white/45 hover:text-white text-xl
                            flex items-center justify-center
                            transition-all duration-200
                            disabled:opacity-15 disabled:cursor-not-allowed
                        "
                    >‹</button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === WAYPOINTS.length - 1}
                        aria-label="Next"
                        className="
                            absolute right-3 top-1/2 -translate-y-1/2 z-20
                            w-10 h-10 rounded-full
                            bg-black/20 hover:bg-black/45 backdrop-blur-sm
                            border border-white/10 hover:border-white/25
                            text-white/45 hover:text-white text-xl
                            flex items-center justify-center
                            transition-all duration-200
                            disabled:opacity-15 disabled:cursor-not-allowed
                        "
                    >›</button>
                </>
            )}

        </div>
    );
}