import {Types} from "./types";
import type {CameraItem, Config, UpdateKey, UpdateValue} from "./types";
import {
    Vector3,
    QuaternionKeyframeTrack,
    PerspectiveCamera,
    Quaternion,
    VectorKeyframeTrack,
    AnimationClip, AnimationMixer, LoopOnce, NormalAnimationBlendMode, AnimationAction
} from "three";

export class CameraInterface {
    #camera: CameraItem
    #mixer: AnimationMixer
    mixerList: AnimationMixer[]
    #clip: AnimationClip
    #action: AnimationAction

    constructor(public config: Config, mixerList: AnimationMixer[]) {
        this.#camera = this.setCamera(config);
        this.updateRotation(config)
        this.updatePosition(config)
        this.#mixer = new AnimationMixer(this.#camera)
        this.#mixer.addEventListener('finished', () => {
            console.log("Анимация завершена!");
            const idx  = mixerList.find((el) => el.getRoot().uuid === this.#camera.uuid)
            if (idx ) {
                // this.mixerList.splice(idx, 1)
                idx.uncacheClip(this.#clip)
            }

        });
        this.mixerList = mixerList
        this.mixerList.push(this.#mixer);
        this.#clip = this.getClip({x:0, y: 0, z:0},{x:10, y: 10, z:10})
        this.#action = this.#mixer.clipAction(this.#clip)
        this.#action.clampWhenFinished = true;  // остаться в последнем кадре
        this.#action.setLoop(LoopOnce, 1);
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

    getQKFT(newLookAt: {x: number; y: number;z: number}, newPosition: {x: number; y: number;z: number}): QuaternionKeyframeTrack {
        const currentPosition = this.#camera.position.clone()
        const currentRotation = this.#camera.rotation
        const currentQuaternion = new Quaternion().setFromEuler(currentRotation);

        const clone = this.#camera.clone()
        // Временное перемещаем камеру в новую позицию и поворачиваем к цели
        clone.position.set(newPosition.x, newPosition.y, newPosition.z);
        clone.lookAt(new Vector3(newLookAt.x, newLookAt.y, newLookAt.z));
        const targetQuaternion = clone.quaternion.clone();


        // Возвращаем камеру в исходное состояние
        clone.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
        clone.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

        // Создаем массив кватернионов для анимации
        const quaternions = [
            currentQuaternion.toArray(),  // начальный кватернион (текущий поворот)
            targetQuaternion.toArray()    // конечный кватернион (новый поворот)
        ].flat();  // преобразуем в плоский массив [x, y, z, w, x, y, z, w]

        return new QuaternionKeyframeTrack(
            ".quaternion",  // путь к свойству объекта
            [0, 1],         // временные метки (0 = начало, 1 = конец)
            quaternions     // массив кватернионов в виде [x, y, z, w, x, y, z, w]
        );
    }

    getClip(newLookAt: {x: number; y: number;z: number}, newPosition: {x: number; y: number;z: number}) {
        const currentPosition = this.#camera.position.clone();
        const positionTrack = new VectorKeyframeTrack(
            ".position",
            [0, 1],
            [currentPosition.x, currentPosition.y, currentPosition.z, newPosition.x, newPosition.y, newPosition.z]
        );

        // Для анимации поворота (как в коде выше):
        const quaternionTrack = this.getQKFT(newLookAt, newPosition);

        console.log(quaternionTrack, 'quaternionTrack')
        console.log(positionTrack, 'positionTrack')
        // Создаем анимационную клип-сцену:
        return new AnimationClip("CameraMove", -1, [positionTrack, quaternionTrack],NormalAnimationBlendMode);
    }

    setMoveCamera(newLookAt: {x: number; y: number;z: number}, newPosition: {x: number; y: number;z: number}): void {
        const clip = this.getClip(newLookAt, newPosition)
        this.#mixer.uncacheClip(this.#clip)
        this.#action = this.#mixer.clipAction(clip);
        const action = new AnimationAction(this.#mixer, clip, this.#camera)
        this.#action.clampWhenFinished = true;  // остаться в последнем кадре
        this.#action.setLoop(LoopOnce, 1);
        // action.crossFadeFrom(action, 1, true)
        this.#action.play()
        console.log(this.#action.getClip())

    }

    updateRotation(config: Config): void {
        const {rotation: {x, y, z}} = config
        this.#camera.rotation.set(x, y, z)
    }

    updatePosition(config: Config): void {
        const {position: {x, y, z}} = config
        this.#camera.position.set(x, y, z)
    }

    // updateCameraLookAt(x: number, y: number, z: number): void {
    //     this.#camera.lookAt(x, y, z)
    // }
    //
    // updateCameraParam(key: UpdateKey, value: UpdateValue): void {
    //     this.#camera[key] = value
    // }
}