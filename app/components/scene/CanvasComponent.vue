<script setup lang="ts">
import * as THREE from 'three'
import {getBoxesLineCenter} from "~~/interfaces/object/helpers";

const sceneRef = ref<HTMLElement | null>(null)

const {scene, renderer, cameraInterface, controlledRenderer}  = useNuxtApp().$api
cameraInterface.setControlledRenderer(controlledRenderer)

onMounted(() => {
  sceneRef.value?.appendChild(renderer.domElement);
})

// Строим сцену с ящиками на осях
buildScene()

setCameraLeft()
// Функция для создания ящика на оси
function createBoxOnAxis(position: THREE.Vector3): THREE.Mesh {
  const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        metalness: 0.1,
        roughness: 0.5
      })
  );
  box.position.copy(position);
  scene.add(box);
  return box;
}

// Функция для создания ящиков вдоль оси X
function createBoxesAlongX(count: number, startX: number = 0, step: number = 2): THREE.Mesh[] {
  const boxes: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const x = startX + i * step;
    boxes.push(createBoxOnAxis(new THREE.Vector3(x, 0, 0)));
  }
  return boxes;
}

// Функция для создания ящиков вдоль оси Z
function createBoxesAlongZ(count: number, startZ: number = 0, step: number = 2): THREE.Mesh[] {
  const boxes: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const z = startZ + i * step;
    boxes.push(createBoxOnAxis(new THREE.Vector3(0, 0, z)));
  }
  return boxes;
}

function setCameraCenter() {
  const cameraParams = calculateCameraPosition(
      window.innerWidth,
      window.innerHeight,
      5,
      10,
      10,
      10
  );

  cameraInterface?.setMoveCamera(cameraParams.target, cameraParams.position)
}

// Функция для построения сцены с ящиками на осях
function buildScene() {
  // Очищаем сцену
  while (scene.children.length > 0) {
    if (scene.children[0]) scene.remove(scene.children[0]);
  }

  // Создаем ящики вдоль осей
  createBoxesAlongX(10, 0, 1.01); // 10 ящиков по оси X от -10 с шагом 2
  createBoxesAlongZ(10, 0, 1.01); // 10 ящиков по оси Z от -10 с шагом 2

  // Добавляем центральный ящик в начале координат
  createBoxOnAxis(new THREE.Vector3(0, 0, 0));

  // Освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // Добавляем оси для наглядности
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
}

function setCameraLeft() {
  cameraInterface?.setMoveCamera(getBoxesLineCenter('z',scene), new THREE.Vector3(10, 5, 10))
}

function setCametaRight() {
  cameraInterface?.setMoveCamera(getBoxesLineCenter('x', scene), new THREE.Vector3(10, 5, 10))
}
interface CameraPositionResult {
  position: THREE.Vector3;
  target: THREE.Vector3;
  distance: number;
  fov: number;
  aspectRatio: number;
}

interface SceneBounds {
  halfX: number;
  halfZ: number;
  halfY: number;
}

function calculateCameraPosition(
    canvasWidth: number,
    canvasHeight: number,
    cameraHeight: number,
    sceneWidthX: number,
    sceneDepthZ: number,
    sceneHeightY: number
): CameraPositionResult {
  // 1. Инициализация базовых параметров
  const target: THREE.Vector3 = new THREE.Vector3(0, sceneHeightY / 2, 0);
  const aspectRatio: number = canvasWidth / Math.max(1, canvasHeight);
  const fov: number = 45;
  const fovRad: number = THREE.MathUtils.degToRad(fov);
  const angle: number = Math.PI / 4; // 45 градусов в радианах

  // 2. Расчет границ сцены
  const sceneBounds: SceneBounds = {
    halfX: sceneWidthX / 2,
    halfZ: sceneDepthZ / 2,
    halfY: sceneHeightY / 2
  };

  // 3. Создание тестовых точек для проверки видимости
  const createTestPoints = (bounds: SceneBounds): THREE.Vector3[] => {
    const { halfX, halfZ, halfY } = bounds;
    return [
      // Углы основания
      new THREE.Vector3(halfX, 0, halfZ),
      new THREE.Vector3(-halfX, 0, halfZ),
      new THREE.Vector3(halfX, 0, -halfZ),
      new THREE.Vector3(-halfX, 0, -halfZ),
      // Верхние углы
      new THREE.Vector3(halfX, sceneHeightY, halfZ),
      new THREE.Vector3(-halfX, sceneHeightY, halfZ),
      new THREE.Vector3(halfX, sceneHeightY, -halfZ),
      new THREE.Vector3(-halfX, sceneHeightY, -halfZ),
      // Центральные точки
      new THREE.Vector3(0, halfY, 0),
      new THREE.Vector3(halfX, halfY, 0),
      new THREE.Vector3(-halfX, halfY, 0),
      new THREE.Vector3(0, halfY, halfZ),
      new THREE.Vector3(0, halfY, -halfZ)
    ];
  };

  const testPoints: THREE.Vector3[] = createTestPoints(sceneBounds);

  // 4. Функция проверки видимости всех точек
  const isSceneFullyVisible = (distance: number): boolean => {
    const cameraPos: THREE.Vector3 = new THREE.Vector3(
        distance * Math.cos(angle),
        cameraHeight,
        distance * Math.sin(angle)
    );

    const testCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        fov,
        aspectRatio,
        0.1,
        distance * 3
    );
    testCamera.position.copy(cameraPos);
    testCamera.lookAt(target);

    const frustum: THREE.Frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(
            testCamera.projectionMatrix,
            testCamera.matrixWorldInverse
        )
    );

    return testPoints.every((point: THREE.Vector3) => frustum.containsPoint(point));
  };

  // 5. Расчет начального расстояния
  const calculateInitialDistance = (): number => {
    const horizontalFov: number = 2 * Math.atan(Math.tan(fovRad / 2) * aspectRatio);
    const verticalFov: number = fovRad;

    const horizontalDistance: number = Math.max(sceneWidthX, sceneDepthZ) /
        (2 * Math.tan(horizontalFov / 2));
    const verticalDistance: number = sceneHeightY / (2 * Math.tan(verticalFov / 2));

    return Math.max(horizontalDistance, verticalDistance) * 1.5;
  };

  let distance: number = calculateInitialDistance();

  // 6. Оптимизация расстояния бинарным поиском
  const optimizeDistance = (initialDistance: number): number => {
    let minDist: number = initialDistance * 0.5;
    let maxDist: number = initialDistance * 1.2;
    const epsilon: number = 0.01;

    for (let i = 0; i < 20; i++) {
      const midDist: number = (minDist + maxDist) / 2;
      if (isSceneFullyVisible(midDist)) {
        maxDist = midDist;
      } else {
        minDist = midDist;
      }
      if (maxDist - minDist < epsilon) break;
    }

    return maxDist * 1.05; // 5% запас
  };

  distance = optimizeDistance(distance);

  // 7. Расчет финальной позиции камеры
  const calculateFinalCameraPosition = (dist: number): THREE.Vector3 => {
    return new THREE.Vector3(
        dist * Math.cos(angle),
        cameraHeight,
        dist * Math.sin(angle)
    );
  };

  return {
    position: calculateFinalCameraPosition(distance),
    target: target,
    distance: distance,
    fov: fov,
    aspectRatio: aspectRatio
  };
}






</script>

<template>
  <div ref="sceneRef" class="w-full h-full ref">
    <div class="controls">
      <u-button class="btn" @click="setCameraLeft">
        left
      </u-button>
      <u-button class="btn move w-1/2" @click="setCameraCenter">
        center
      </u-button>
      <u-button class="btn move w-1/2" @click="setCametaRight">
        right
      </u-button>
    </div>

  </div>
</template>

<style>

.controls {
  position: absolute;
  left: 0px;
  top: 0px;
}

.btn {

  padding: 10px 20px;
}

.move {
  left: 50%;
}

.ref {
  margin: 0;
  padding: 0;
}
</style>