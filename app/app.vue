<template>
  <div ref="sceneRef" class="w-full h-full ref">

    <u-button class="btn " @click="setCameraStart">
      start
    </u-button>
    <u-button class="btn move w-1/2" @click="setCameraMove">
      move
    </u-button>
  </div>
</template>

<script setup lang="ts">

import * as THREE from 'three'
import {CameraInterface} from "~~/interfaces/camera";
import CameraConfig from "~~/configs/CameraConfig";
import type {AnimationMixer} from "three";
import {AnimationControlledRenderer} from "~~/interfaces/animation";

const clock = new THREE.Clock()
const sceneRef = ref<HTMLElement | null>(null)
const scene = new THREE.Scene()
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null
let cameraInterface: CameraInterface | null = null
const mixerList = ref<AnimationMixer[]>([])

let controlledRenderer: AnimationControlledRenderer | null = null

function addLeft() {
  const aLight = new THREE.AmbientLight('#ffffff', 1)
  scene.add(aLight)
  const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1)
  scene.add(rectAreaLight)
  rectAreaLight.position.set(0, 0, 0)
  const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), new THREE.MeshStandardMaterial({
    color: 0x22dddd,
    transparent: true
  }))
  scene.add(box)
  box.position.set(0, 0, 0)
  const wall = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 0.001), new THREE.MeshStandardMaterial({
    color: '#333333',
    transparent: true
  }))
  scene.add(wall)
}


function setCameraStart() {
  cameraInterface?.setMoveCamera(new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 5, 10))
}

function setCameraMove() {
  cameraInterface?.setMoveCamera(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-10, 5, -45))
}


onMounted(() => {
  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)


  const cameraConfig = CameraConfig({width: window.innerWidth, height: window.innerHeight})
  cameraInterface = new CameraInterface(cameraConfig)
  camera = cameraInterface.camera

  // camera.position.set(0,0,0)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  scene.add(camera)
  controlledRenderer = new AnimationControlledRenderer(scene, camera, renderer);
  cameraInterface.setControlledRenderer(controlledRenderer)

  sceneRef.value?.appendChild(renderer.domElement);
  renderer.render(scene, camera)
  setCameraStart()

  window.addEventListener('resize', () => {
    if (!renderer || !camera) return
    renderer.setSize(window.innerWidth, window.innerHeight)
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  })
  addLeft()
})

onBeforeUnmount(() => {
  renderer = null
  camera = null
})
</script>
<style>

.btn {
  position: absolute;
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