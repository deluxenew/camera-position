import * as THREE from "three";

interface RotationConfig {
    startEuler?: THREE.Euler; // Начальный поворот (по умолчанию текущий поворот объекта)
    endEuler: THREE.Euler;    // Конечный поворот
    duration?: number;        // Длительность (сек)
    steps?: number;           // Количество кадров
}

export default function getSmoothRotationMixer(
    yourObject: THREE.Object3D,
    config: RotationConfig
): { quatValues: ArrayLike<number>; times: number[] } {
    const {
        startEuler,
        endEuler,
        duration = 4,
        steps = 100
    } = config;

    const times = [];
    const quatValues = [];

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

        // Сферическая интерполяция
        const currentQuat = new THREE.Quaternion();
        currentQuat.slerpQuaternions(startQuat, endQuat, easedT);

        times.push(t);
        quatValues.push(
            currentQuat.x,
            currentQuat.y,
            currentQuat.z,
            currentQuat.w
        );
    }
    return {quatValues, times}
}