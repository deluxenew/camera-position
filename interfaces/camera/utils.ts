import * as THREE from "three";

interface RotationConfig {
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    startEuler?: THREE.Euler; // Начальный поворот (по умолчанию текущий поворот объекта)
    endEuler: THREE.Euler;    // Конечный поворот
    duration?: number;        // Длительность (сек)
    steps?: number;           // Количество кадров
}

export default function getSmoothRotationMixer(
    yourObject: THREE.Object3D,
    config: RotationConfig
): { quatValues: ArrayLike<number>; posValues: ArrayLike<number>; times: number[] } {
    const {
        startPosition,
        endPosition,
        startEuler,
        endEuler,
        duration = 4,
        steps = 100
    } = config;

    const times = [];
    const quatValues = [];
    const posValues = [];

    // Конвертируем углы Эйлера в кватернионы
    const startQuat = startEuler
        ? new THREE.Quaternion().setFromEuler(startEuler)
        : yourObject.quaternion.clone();
    const endQuat = new THREE.Quaternion().setFromEuler(endEuler);

    // Easing-функция для плавности
    const cubicEaseInOut = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * duration;
        const easedT = cubicEaseInOut(t / duration);

        // Интерполяция вращения
        const currentQuat = new THREE.Quaternion();
        currentQuat.slerpQuaternions(startQuat, endQuat, easedT);

        // Интерполяция позиции с той же функцией плавности
        const currentPos = new THREE.Vector3().lerpVectors(
            startPosition,
            endPosition,
            easedT
        );

        times.push(t);
        quatValues.push(
            currentQuat.x,
            currentQuat.y,
            currentQuat.z,
            currentQuat.w
        );
        posValues.push(
            currentPos.x,
            currentPos.y,
            currentPos.z
        );
    }
    return {quatValues, posValues, times};
}