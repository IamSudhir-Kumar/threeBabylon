import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, SceneLoader, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";
import { HdriManager } from "./features/HdriManager";
class App {
    constructor() {
        Object.defineProperty(this, "hdriManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        document.body.appendChild(canvas);
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            engine.resize();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(1, 1, 0), scene);
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        const pbrMaterial = new PBRMaterial("pbrMaterial", scene);
        sphere.material = pbrMaterial;
        this.hdriManager = new HdriManager(scene);
        this.createHdriDropdown();
        this.loadGLBModel(scene);
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
    createHdriDropdown() {
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
            const selectedHdri = event.target.value;
            this.hdriManager.setHdri(selectedHdri);
        });
    }
    loadGLBModel(scene) {
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
