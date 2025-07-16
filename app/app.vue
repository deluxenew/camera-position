<template>
  <div class="w-full h-full ref" ref="sceneRef">

    <u-button class="btn" @click="addLeft">
      box
    </u-button>
  </div>
</template>

<script setup lang="ts">

import * as THREE from 'three'
const clock = new THREE.Clock()
const delta = clock.getDelta()
const sceneRef = ref<HTMLElement | null>(null)
const scene = new THREE.Scene()
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null

let mixer;

function addLeft() {
  const aLight = new THREE.AmbientLight('#ffffff', 1)
  scene.add(aLight)
  const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1)
  scene.add(rectAreaLight)
  rectAreaLight.position.set(5, 5, 5)
  const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), new THREE.MeshStandardMaterial({
    color: 0x22dddd,
    transparent: true
  }))
  scene.add(box)
  box.position.set(2, 1, 1)
}


function animate() {
  if (!renderer) return
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer?.update(delta);
  renderer.render(scene, camera);
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(10, 10, 10)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  scene.add(camera)


  sceneRef.value?.appendChild(renderer.domElement);
  renderer.render(scene, camera)


  window.addEventListener('resize', () => {
    if (!renderer || !camera) return
    renderer.setSize(window.innerWidth, window.innerHeight)
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  })
  animate()
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

.ref {
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
}
</style>