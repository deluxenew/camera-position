<template>
  <div ref="sceneRef" class="w-full h-full ref">

    <u-button class="btn" @click="setCameraStart">
      start
    </u-button>
    <u-button class="btn move" @click="setCameraMove">
      move
    </u-button>
  </div>
</template>

<script setup lang="ts">

import * as THREE from 'three'
import {CameraInterface} from "~~/interfaces/camera";
import CameraConfig from "~~/configs/CameraConfig";
import type {AnimationMixer} from "three";
const clock = new THREE.Clock()
const sceneRef = ref<HTMLElement | null>(null)
const scene = new THREE.Scene()
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null
let cameraInterface: CameraInterface | null = null
const mixerList: AnimationMixer[] = []

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
}


function animate() {
  if (!renderer || !camera) return
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixerList.forEach((mixer) => {

    mixer?.update(delta);
    console.log(123)
  })

  renderer.render(scene, camera);
}
function setCameraStart() {
  cameraInterface?.setMoveCamera({x:0, y: 0, z:0},{x:3, y: 3, z:3})
}

function setCameraMove() {
  cameraInterface?.setMoveCamera({x:0, y: 0, z:0},{x:20, y: 20, z:15})
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)


  const cameraConfig = CameraConfig({width: window.innerWidth, height:window.innerHeight})
  cameraInterface = new CameraInterface(cameraConfig, mixerList)
  camera = cameraInterface.camera

  camera.position.set(0,0,0)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  scene.add(camera)


  sceneRef.value?.appendChild(renderer.domElement);
  renderer.render(scene, camera)


  // window.addEventListener('resize', () => {
  //   if (!renderer || !camera) return
  //   renderer.setSize(window.innerWidth, window.innerHeight)
  //   const canvas = renderer.domElement;
  //   camera.aspect = canvas.clientWidth / canvas.clientHeight;
  //   camera.updateProjectionMatrix();
  // })
  animate()
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