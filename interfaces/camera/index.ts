import {Types} from "./types";
import type {CameraItem, Config} from "./types";
import {
    Vector3,
    QuaternionKeyframeTrack,
    PerspectiveCamera,
    VectorKeyframeTrack,
    AnimationClip,
    AnimationMixer,
    LoopOnce,
    NormalAnimationBlendMode, InterpolateSmooth
} from "three";

export class CameraInterface {
    #camera: CameraItem;
    #mixer: AnimationMixer;
    mixerList: AnimationMixer[]
    #clip: AnimationClip
    targetPosition: Vector3

    constructor(public config: Config, mixerList: AnimationMixer[]) {
        this.#camera = this.setCamera(config);
        this.updateRotation(config);
        this.updatePosition(config);
        this.#mixer = new AnimationMixer(this.#camera);
        this.mixerList = mixerList;
        // this.mixerList.push(this.#mixer);

        const lookAtVec = new Vector3(0, 0, 0);
        const positionVec = new Vector3(0, 0, 0);
        this.#clip = this.createAnimationClip(lookAtVec, positionVec);
        // Cleanup listener for finished animations
        this.#mixer.addEventListener('finished', (e) => {
            // if (this.#currentAction === e.action) {
            //     this.#currentAction = null;
            // }
            const mixer = e.action.getMixer()
            // this.#camera.position.set(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z)
            console.log(this.#camera.position)
            this.mixerList.splice(this.mixerList.indexOf(mixer), 1);

        });
        this.targetPosition = this.#camera.position.clone();
    }

    get camera(): CameraItem {
        return this.#camera;
    }

    setCamera(config: Config): CameraItem {
        switch (config.type) {
            case Types.PERSPECTIVE: {
                const {width, height} = config;
                return new PerspectiveCamera(75, width / height, 0.1, 1000);
            }
        }
    }

    private createQuaternionTrack(
        newLookAt: Vector3,
        newPosition: Vector3,
        duration: number = 1
    ): QuaternionKeyframeTrack {
        const currentQuaternion = this.#camera.quaternion.clone();

        // Create temporary camera to calculate target rotation
        const tempCamera = this.#camera.clone();
        tempCamera.position.copy(newPosition);
        tempCamera.lookAt(newLookAt);
        const targetQuaternion = tempCamera.quaternion.clone();

        return new QuaternionKeyframeTrack(
            ".quaternion",
            [0, duration],
            [...currentQuaternion.toArray(), ...targetQuaternion.toArray()],
        );
    }

    private createPositionTrack(
        newPosition: Vector3,
        duration: number = 1
    ): VectorKeyframeTrack {
       const currentPosition = this.#camera.position.clone();
        console.log(currentPosition, 'currentPosition')

        return new VectorKeyframeTrack(
            ".position",
            [0, duration],
            [
                currentPosition.x, currentPosition.y, currentPosition.z,
                newPosition.x, newPosition.y, newPosition.z
            ],
            InterpolateSmooth
        );
    }

    private createAnimationClip(
        newLookAt: Vector3,
        newPosition: Vector3,
        duration: number = 1
    ): AnimationClip {
        const name = 'CameraAnimation_' + this.mixerList.length;
        const positionTrack = this.createPositionTrack(newPosition, duration);
        const quaternionTrack = this.createQuaternionTrack(newLookAt, newPosition, duration);

        return new AnimationClip(
            name,
            -1,
            [positionTrack, quaternionTrack],
            NormalAnimationBlendMode
        );
    }

    setMoveCamera(newLookAt: { x: number; y: number; z: number }, newPosition: {
        x: number;
        y: number;
        z: number
    }): void {
        // Stop current animation if any
        this.#mixer = new AnimationMixer(this.#camera);



        // Convert to Vector3 for easier handling
        const lookAtVec = new Vector3(newLookAt.x, newLookAt.y, newLookAt.z);
        this.targetPosition = new Vector3(newPosition.x, newPosition.y, newPosition.z);

        // Create new animation
        this.#clip = this.createAnimationClip(lookAtVec, this.targetPosition);
        const action = this.#mixer.clipAction(this.#clip);

        // Configure animation
        action.clampWhenFinished = true;
        action.setLoop(LoopOnce, 1);
        action.play();

        this.mixerList.forEach(mixer => {
            mixer.stopAllAction()
            this.mixerList.splice(this.mixerList.indexOf(mixer), 1);
        })
        this.mixerList.push(this.#mixer);


        this.#mixer.addEventListener('finished', (e) => {
            const mixer = e.action.getMixer()
            this.mixerList.splice(this.mixerList.indexOf(mixer), 1);
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