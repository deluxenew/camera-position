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
        rigth
      </u-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {CameraInterface} from "~~/interfaces/camera";
import CameraConfig from "~~/configs/CameraConfig";
import {AnimationControlledRenderer} from "~~/interfaces/animation";

const sceneRef = ref<HTMLElement | null>(null)
const scene = new THREE.Scene()
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null
let cameraInterface: CameraInterface | null = null
let controlledRenderer: AnimationControlledRenderer | null = null

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

// Функция для построения сцены с ящиками на осях
function buildScene() {
  // Очищаем сцену
  while (scene.children.length > 0) {
    if (scene.children[0]) scene.remove(scene.children[0]);
  }

  // Создаем ящики вдоль осей
  createBoxesAlongX(10, 0, 1.1); // 10 ящиков по оси X от -10 с шагом 2
  createBoxesAlongZ(10, 0, 1.1); // 10 ящиков по оси Z от -10 с шагом 2

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
  cameraInterface?.setMoveCamera(getBoxesLineCenter('z'), new THREE.Vector3(10, 5, 10))
}

function setCameraCenter() {
  cameraInterface?.setMoveCamera(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 5, 10))
}


function setCametaRight() {
  cameraInterface?.setMoveCamera(getBoxesLineCenter('x'), new THREE.Vector3(10, 5, 10))
}

function getBoxesLineCenter(axis: 'x' | 'z'): THREE.Vector3 {
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

onMounted(() => {
  renderer = new THREE.WebGLRenderer({antialias: true, depth: true});
  renderer.setSize(window.innerWidth, window.innerHeight)

  const cameraConfig = CameraConfig({width: window.innerWidth, height: window.innerHeight})
  cameraInterface = new CameraInterface(cameraConfig)
  camera = cameraInterface.camera

  camera.lookAt(new THREE.Vector3(0, 0, 0))
  scene.add(camera)

  controlledRenderer = new AnimationControlledRenderer(scene, camera, renderer);
  cameraInterface.setControlledRenderer(controlledRenderer)

  sceneRef.value?.appendChild(renderer.domElement);

  // Строим сцену с ящиками на осях
  buildScene()

  renderer.render(scene, camera)
  setCameraLeft()

  window.addEventListener('resize', () => {
    if (!renderer || !camera) return
    renderer.setSize(window.innerWidth, window.innerHeight)
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  })
})

onBeforeUnmount(() => {
  renderer = null
  camera = null
})
</script>

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

body {
  margin: 0;
  padding: 0;
}
</style>