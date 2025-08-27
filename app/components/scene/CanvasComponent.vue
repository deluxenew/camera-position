<script setup lang="ts">
import * as THREE from 'three'
import {createBoxesAlongX, createBoxesAlongZ, createBoxOnAxis, getBoxesLineCenter} from "~~/interfaces/object/helpers";
import {calculateCameraPosition} from "~~/interfaces/camera/utils";

const sceneRef = ref<HTMLElement | null>(null)

const {scene, renderer, cameraInterface }  = useNuxtApp().$api

onMounted(() => {
  sceneRef.value?.appendChild(renderer.domElement);
})

// Строим сцену с ящиками на осях
buildScene()

setCameraLeft()

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
  const boxesX = createBoxesAlongX(10, 0, 1.01); // 10 ящиков по оси X от -10 с шагом 2
  const boxesZ = createBoxesAlongZ(10, 0, 1.01); // 10 ящиков по оси Z от -10 с шагом 2

  // Добавляем центральный ящик в начале координат
  const boxFirst = createBoxOnAxis(new THREE.Vector3(0, 0, 0));
  const boxes = [boxFirst, boxesX, boxesZ].flat()
  boxes.forEach((box) => {scene.add(box);});

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