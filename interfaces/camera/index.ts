import {Types} from "./types";
import type {CameraItem, Config, UpdateKey, UpdateValue} from "./types";
import {PerspectiveCamera} from "three";

export class CameraInterface {
    #camera: CameraItem

    constructor(public config: Config) {
        this.#camera = this.setCamera(config);
        this.updateRotation(config)
        this.updatePosition(config)
    }

    get camera(): CameraItem {
        return this.#camera
    }

    setCamera(config: Config): CameraItem {
        switch (config.type) {
            case Types.PERSPECTIVE: {
                const {width, height} = config
                return new PerspectiveCamera(75, width / height, 0.1, 1000)
            }
        }
    }

    updateRotation(config: Config): void {
        const {rotation: {x, y, z}} = config
        this.#camera.rotation.set(x, y, z)
    }

    updatePosition(config: Config): void {
        const {position: {x, y, z}} = config
        this.#camera.position.set(x, y, z)
    }

    updateCameraLookAt(x: number, y: number, z: number): void {
        this.#camera.lookAt(x, y, z)
    }

    updateCameraParam(key: UpdateKey, value: UpdateValue): void {
        this.#camera[key] = value
    }
}