import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, SceneLoader, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders"; // Enable GLB/GLTF support
import { HdriManager } from "./features/HdriManager";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";

class App {
    private hdriManager: HdriManager;
    private scene: Scene;
    private xrExperience: WebXRDefaultExperience | null = null;

    constructor() {
        const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        document.body.appendChild(canvas);

        const engine = new Engine(canvas, true);
        this.scene = new Scene(engine);

        // Resize dynamically
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            engine.resize();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create camera
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), this.scene);
        camera.attachControl(canvas, true);

        // Backup light if HDRI fails
        new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);

        // Create sphere (for testing)
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);

        // Use PBR material for HDR reflections
        const pbrMaterial = new PBRMaterial("pbrMaterial", this.scene);
        sphere.material = pbrMaterial;

        // Initialize HDRI Manager
        this.hdriManager = new HdriManager(this.scene);
        this.createHdriDropdown();

        // Load model
        this.loadGLBModel();

        // Add XR button for AR/VR
        this.createXRButton();

        // Enable WebXR
        this.setupXR();

        // Render loop
        engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    private createHdriDropdown() {
        const dropdown = document.createElement("select");
        dropdown.style.position = "absolute";
        dropdown.style.top = "10px";
        dropdown.style.left = "10px";
        dropdown.style.zIndex = "100";
        document.body.appendChild(dropdown);

        const hdriOptions = this.hdriManager.getAvailableHdris();
        hdriOptions.forEach((hdri) => {
            const option = document.createElement("option");
            option.value = hdri;
            option.textContent = hdri;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener("change", (event) => {
            const selectedHdri = (event.target as HTMLSelectElement).value;
            this.hdriManager.setHdri(selectedHdri);
        });
    }

    private async setupXR() {
        try {
            this.xrExperience = await this.scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: "immersive-ar", // Defaults to AR if supported
                    referenceSpaceType: "local-floor",
                },
                optionalFeatures: ["hand-tracking", "anchors", "hit-test"], // Adds mobile AR support
            });

            console.log("WebXR initialized", this.xrExperience);
        } catch (error) {
            console.error("WebXR setup failed", error);
        }
    }

    private createXRButton() {
        const button = document.createElement("button");
        button.textContent = "Enter AR/VR";
        button.style.position = "absolute";
        button.style.bottom = "20px";
        button.style.left = "50%";
        button.style.transform = "translateX(-50%)";
        button.style.padding = "10px 20px";
        button.style.fontSize = "16px";
        button.style.cursor = "pointer";
        document.body.appendChild(button);

        button.addEventListener("click", async () => {
            if (this.xrExperience) {
                try {
                    const isARSupported = await navigator.xr?.isSessionSupported?.("immersive-ar");
                    const mode = isARSupported ? "immersive-ar" : "immersive-vr";
                    
                    await this.xrExperience.baseExperience.enterXRAsync(mode, "local-floor");
                } catch (error) {
                    console.error("Failed to enter XR mode", error);
                }
            } else {
                console.warn("XR is not available on this device.");
            }
        });
    }

    private loadGLBModel() {
        SceneLoader.ImportMesh("", "models/", "b_s.glb", this.scene, (meshes) => {
            meshes.forEach((mesh) => {
                if (mesh.material instanceof PBRMaterial) {
                    mesh.material.environmentIntensity = this.scene.environmentIntensity;
                }
            });
            console.log("GLB Model Loaded!");
        });
    }
}

new App();



//////Testing github actions