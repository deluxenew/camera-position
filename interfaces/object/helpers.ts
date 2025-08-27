import * as THREE from "three";
export function getBoxesLineCenter(axis: 'x' | 'z', scene: THREE.Scene): THREE.Vector3 {
    // Находим все боксы на сцене
    const boxes = scene.children.filter(child =>
        child instanceof THREE.Mesh &&
        child.geometry instanceof THREE.BoxGeometry
    ) as THREE.Mesh[];

    // Фильтруем боксы, расположенные на указанной оси
    const axisBoxes = boxes.filter(box => {
        if (axis === 'x') {
            return box.position.z === 0 && box.position.y === 0;
        } else {
            return box.position.x === 0 && box.position.y === 0;
        }
    });

    if (axisBoxes.length === 0) {
        return new THREE.Vector3(0, 0, 0);
    }

    // Вычисляем среднее положение по оси
    const positions = axisBoxes.map(box => box.position[axis]);
    const min = Math.min(...positions);
    const max = Math.max(...positions);
    const center = (min + max) / 2;

    if (axis === 'x') {
        return new THREE.Vector3(center, 0, 0);
    } else {
        return new THREE.Vector3(0, 0, center);
    }
}
