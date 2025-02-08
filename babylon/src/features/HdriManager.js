import { HDRCubeTexture, PBRMaterial } from "@babylonjs/core";
export class HdriManager {
    constructor(scene) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentHdri", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "availableHdris", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.scene = scene;
        this.availableHdris = {
            "Studio": "HDRI/Nebula.hdr",
            "Sunset": "HDRI/mew.hdr",
            "Space": "textures/space.hdr",
        };
        this.setHdri("Studio");
    }
    setHdri(name) {
        if (!this.availableHdris[name]) {
            console.warn(`HDRI "${name}" not found.`);
            return;
        }
        if (this.currentHdri) {
            this.currentHdri.dispose();
        }
        this.currentHdri = new HDRCubeTexture(this.availableHdris[name], this.scene, 512);
        this.scene.environmentTexture = this.currentHdri;
        this.scene.createDefaultSkybox(this.currentHdri, true, 1000);
        this.adjustLighting();
        console.log(`HDRI changed to: ${name}`);
    }
    adjustLighting() {
        if (this.currentHdri) {
            this.scene.environmentIntensity = 1.5;
        }
        this.scene.meshes.forEach((mesh) => {
            if (mesh.material instanceof PBRMaterial) {
                mesh.material.environmentIntensity = this.scene.environmentIntensity;
            }
        });
    }
    getAvailableHdris() {
        return Object.keys(this.availableHdris);
    }
}
