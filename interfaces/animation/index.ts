import * as THREE from 'three';
import type { AnimationMixer } from 'three';

export class AnimationControlledRenderer {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private clock: THREE.Clock;
    private mixers: AnimationMixer[];
    private isRendering: boolean;
    private animationId: number | null;

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clock = new THREE.Clock();
        this.mixers = [];
        this.isRendering = false;
        this.animationId = null;
    }

    /**
     * Добавляет миксер в отслеживаемые и запускает рендеринг, если нужно
     */
    addMixer(mixer: AnimationMixer): void {
        if (this.mixers.includes(mixer)) return;
        this.mixers.push(mixer);
        this.startRenderingIfNeeded();
    }

    /**
     * Удаляет миксер и останавливает рендеринг, если анимаций не осталось
     */
    removeMixer(mixer: AnimationMixer): void {
        const index = this.mixers.indexOf(mixer);
        if (index !== -1) {
            this.mixers.splice(index, 1);
        }
        // Рендеринг остановится автоматически в animate()
    }

    /**
     * Основной цикл рендеринга
     */
    private animate(): void {
        const delta = this.clock.getDelta();
        let needsUpdate = false;
        console.log(123)
        // Обновляем все анимации
        this.mixers.forEach(mixer => {
            mixer.update(delta);
            needsUpdate = true;
        });

        // Рендерим только если были изменения
        if (needsUpdate) {
            this.renderer.render(this.scene, this.camera);
        }

        // Продолжаем рендеринг, если есть активные анимации
        if (this.mixers.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.isRendering = false;
            this.animationId = null;
        }
    }

    /**
     * Запускает рендеринг, если есть анимации и он не запущен
     */
    private startRenderingIfNeeded(): void {
        if (this.mixers.length > 0 && !this.isRendering) {
            this.isRendering = true;
            this.animate();
        }
    }

    /**
     * Принудительная остановка всех анимаций и рендеринга
     */
    stopAll(): void {
        this.mixers.forEach(mixer => mixer.stopAllAction());
        this.mixers = [];
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isRendering = false;
    }
}

