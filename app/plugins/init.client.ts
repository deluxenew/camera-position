import {defineNuxtPlugin} from "#imports";
import * as THREE from "three";
import CameraConfig from "~~/configs/CameraConfig";
import {CameraInterface} from "~~/interfaces/camera";
import {AnimationControlledRenderer} from "~~/interfaces/animation";

export default defineNuxtPlugin({
    name: 'my-plugin',
    enforce: 'pre',
    async setup () {
        const scene = new THREE.Scene()
        const renderer = new THREE.WebGLRenderer({antialias: true, depth: true});
        renderer.setSize(window.innerWidth, window.innerHeight)

        const cameraConfig = CameraConfig({width: window.innerWidth, height: window.innerHeight})
        const cameraInterface = new CameraInterface(cameraConfig)
        const camera = cameraInterface.camera

        camera.lookAt(new THREE.Vector3(0, 0, 0))
        scene.add(camera)

        const controlledRenderer = new AnimationControlledRenderer(scene, camera, renderer);
        cameraInterface.setControlledRenderer(controlledRenderer)

        // sceneRef.value?.appendChild(renderer.domElement);
        // renderer.render(scene, camera)
        window.addEventListener('resize', () => {
            if (!renderer || !camera) return
            renderer.setSize(window.innerWidth, window.innerHeight)
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera)
        })
        return {
            provide: {
                api: {
                    renderer,
                    cameraInterface,
                    scene,
                    camera,
                    controlledRenderer
                }
            }
        }
    },
})