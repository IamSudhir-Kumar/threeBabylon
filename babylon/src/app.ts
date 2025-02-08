import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, SceneLoader, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders"; // Enable GLB/GLTF support
import { HdriManager } from "./features/HdriManager";

class App {
    private hdriManager: HdriManager;

    constructor() {
        const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        document.body.appendChild(canvas);

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        // Resize canvas dynamically
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            engine.resize();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create camera
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Add light (backup in case HDRI is missing)
        new HemisphericLight("light", new Vector3(1, 1, 0), scene);

        // Create sphere (for testing)
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        // Use PBR material for HDR reflections
        const pbrMaterial = new PBRMaterial("pbrMaterial", scene);
        sphere.material = pbrMaterial;

        // Initialize HDRI Manager
        this.hdriManager = new HdriManager(scene);

        // Add HDRI selection dropdown
        this.createHdriDropdown();

        // Load GLB Model
        this.loadGLBModel(scene);

        // Render loop
        engine.runRenderLoop(() => {
            scene.render();
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

    private loadGLBModel(scene: Scene) {
        SceneLoader.ImportMesh("", "models/", "b_s.glb", scene, (meshes) => {
            meshes.forEach((mesh) => {
                if (mesh.material instanceof PBRMaterial) {
                    mesh.material.environmentIntensity = scene.environmentIntensity;
                }
            });
            console.log("GLB Model Loaded!");
        });
    }
}

new App();
