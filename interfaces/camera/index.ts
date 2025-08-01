import {Types} from "./types";
import type {CameraItem, Config} from "./types";
import { Euler
} from "three";
import type {Vector3, QuaternionKeyframeTrack, VectorKeyframeTrack, AnimationClip, AnimationMixer,

     AnimationAction} from "three";

import * as THREE from "three";
import getSmoothRotationMixer from "~~/interfaces/camera/utils";
import type {AnimationControlledRenderer} from "~~/interfaces/animation";

export class CameraInterface {
    #camera: CameraItem;
    #mixer: AnimationMixer;
    mixerList: AnimationMixer[] = []
    #clip: AnimationClip
    targetPosition: Vector3
    controlledRenderer: AnimationControlledRenderer | null = null;

    constructor(public config: Config) {
        this.#camera = this.setCamera(config);
        this.updateRotation(config);
        this.updatePosition(config);
        this.#mixer = new THREE.AnimationMixer(this.#camera);


        const lookAtVec = new THREE.Vector3(0, 0, 0);
        const positionVec = new THREE.Vector3(-10, 3, 0);
        this.#clip = this.createAnimationClip(lookAtVec, positionVec);
        // Cleanup listener for finished animations
        this.#mixer.addEventListener('finished', this.finishAnimation);
        this.targetPosition = this.#camera.position.clone();
    }

    setControlledRenderer(controlledRenderer: AnimationControlledRenderer) {
        this.controlledRenderer = controlledRenderer;
    }

    finishAnimation(e: {action: AnimationAction; direction: number}) {
        const mixer = e.action.getMixer()
        this.controlledRenderer?.removeMixer(mixer)
    }

    get camera(): CameraItem {
        return this.#camera;
    }

    setCamera(config: Config): CameraItem {
        switch (config.type) {
            case Types.PERSPECTIVE: {
                const {width, height} = config;
                return new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            }
        }
    }

    private createTracks(
        newLookAt: Vector3,
        newPosition: Vector3,
        duration: number = 1
    ): {positionTrack: THREE.VectorKeyframeTrack; quatTrack: THREE.QuaternionKeyframeTrack} {
        const currentRotation = this.#camera.rotation.clone();
        const currentPosition = this.#camera.position.clone();

        const tempCamera = this.#camera.clone();
        tempCamera.position.copy(newPosition);
        tempCamera.lookAt(newLookAt);
        const targetRotation = tempCamera.rotation.clone();

        const {quatValues, times, posValues} = getSmoothRotationMixer(this.#camera, {
            duration,
            steps: 1000,
            startEuler: new Euler(currentRotation.x, currentRotation.y, currentRotation.z),
            endEuler: new Euler(targetRotation.x, targetRotation.y, targetRotation.z),
            startPosition: currentPosition,
            endPosition: newPosition,
        })



        // Create temporary camera to calculate target rotation

        return {
            positionTrack: new THREE.VectorKeyframeTrack(
                ".position",
                times,
                posValues
            ),
            quatTrack: new THREE.QuaternionKeyframeTrack(
                ".quaternion",
                times,
                quatValues,
            )
        }
    }

    private createPositionTrack(
        newPosition: Vector3,
        duration: number = 1
    ): VectorKeyframeTrack {
       const currentPosition = this.#camera.position.clone();

        return new THREE.VectorKeyframeTrack(
            ".position",
            [0, duration],
            [
                currentPosition.x, currentPosition.y, currentPosition.z,
                newPosition.x, newPosition.y, newPosition.z
            ],
        );
    }

    private createAnimationClip(
        newLookAt: Vector3,
        newPosition: Vector3,
        duration: number = 1
    ): AnimationClip {
        const name = 'CameraAnimation_' + this.mixerList.length;
        // const positionTrack = this.createPositionTrack(newPosition, duration);
        const {positionTrack,quatTrack} = this.createTracks(newLookAt, newPosition, duration);

        return new THREE.AnimationClip(
            name,
            -1,
            [positionTrack, quatTrack],
            THREE.NormalAnimationBlendMode
        );
    }

    setMoveCamera(newLookAt: { x: number; y: number; z: number }, newPosition: {
        x: number;
        y: number;
        z: number
    }): void {
        // Stop current animation if any
        this.#mixer = new THREE.AnimationMixer(this.#camera);

        // Convert to Vector3 for easier handling
        const lookAtVec = new THREE.Vector3(newLookAt.x, newLookAt.y, newLookAt.z);
        this.targetPosition = new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z);

        // Create new animation
        this.#clip = this.createAnimationClip(lookAtVec, this.targetPosition);
        this.#clip.optimize()
        const action = this.#mixer.clipAction(this.#clip);
        this.controlledRenderer?.stopAll()
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce, 1);
        this.controlledRenderer?.addMixer(this.#mixer);
        action.play();


        this.#mixer.addEventListener('finished', (e) => {
            const mixer = e.action.getMixer()
            this.controlledRenderer?.removeMixer(mixer)
        });
    }

    updateRotation(config: Config): void {
        const {rotation: {x, y, z}} = config;
        this.#camera.rotation.set(x, y, z);
    }

    updatePosition(config: Config): void {
        const {position: {x, y, z}} = config;
        this.#camera.position.set(x, y, z);
    }
}
