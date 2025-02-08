import { Scene, HDRCubeTexture, PBRMaterial, Mesh } from "@babylonjs/core";

export class HdriManager {
    private scene: Scene;
    private currentHdri: HDRCubeTexture | null = null;
    private availableHdris: { [key: string]: string };

    constructor(scene: Scene) {
        this.scene = scene;

        // Define available HDRIs
        this.availableHdris = {
            "Studio": "HDRI/Nebula.hdr",
            "Sunset": "HDRI/mew.hdr",
            "Space": "textures/space.hdr",
        };

        // Set default HDRI
        this.setHdri("Studio");
    }

    public setHdri(name: string) {
        if (!this.availableHdris[name]) {
            console.warn(`HDRI "${name}" not found.`);
            return;
        }

        // Dispose old HDRI
        if (this.currentHdri) {
            this.currentHdri.dispose();
        }

        // Load new HDRI
        this.currentHdri = new HDRCubeTexture(this.availableHdris[name], this.scene, 512);
        this.scene.environmentTexture = this.currentHdri;

        // Create skybox
        this.scene.createDefaultSkybox(this.currentHdri, true, 1000);

        // Adjust scene lighting
        this.adjustLighting();

        console.log(`HDRI changed to: ${name}`);
    }

    private adjustLighting() {
        // Adjust model exposure based on HDR brightness
        if (this.currentHdri) {
            this.scene.environmentIntensity = 1.5; // Adjust brightness level
        }

        // Ensure models use PBR for better reflections
        this.scene.meshes.forEach((mesh) => {
            if (mesh.material instanceof PBRMaterial) {
                mesh.material.environmentIntensity = this.scene.environmentIntensity;
            }
        });
    }

    public getAvailableHdris(): string[] {
        return Object.keys(this.availableHdris);
    }
}

