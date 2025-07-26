import {PerspectiveCamera} from "three";
import type {PerspectiveCameraJSONObject} from "three/src/cameras/PerspectiveCamera";
import type {Object3DJSONObject} from "three/src/core/Object3D";

export type CameraItem = PerspectiveCamera

export enum Types {
    PERSPECTIVE = 'PERSPECTIVE',
}

export enum Names {
    GENERAL = 'GENERAL',
}

export function F(a: UpdateKey) {
    return PerspectiveCamera[a];
}

export interface PerspectiveCameraConfig {
    name: Names;
    width: number;
    height: number;
    type: Types.PERSPECTIVE
    zoom: number
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
}

export type UpdateKey = keyof Omit<PerspectiveCameraJSONObject, keyof Object3DJSONObject>
export type UpdateValue = ReturnType<typeof F>

export type Config = PerspectiveCameraConfig