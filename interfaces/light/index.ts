import type {Config, LightItem} from "./types";
import {Types} from "./types";

import {RectAreaLight} from "three";

export class LightInterface {
    constructor(public config: Config) {
    }

    get lightItem(): LightItem {
        return this.setLightItem(this.config)
    }

    setLightItem(config: Config): LightItem {
        function setPosition(lightItem: LightItem): void {
            const {position: {x, y, z} = {}} = config
            lightItem.position.set(x, y, z)
        }

        function setRotation(lightItem: LightItem): void {
            const {rotation: {x, y, z} = {}} = config
            lightItem.rotation.set(x, y, z);
        }

        switch (config.type) {
            case Types.RECT_AREA_LIGHT: {
                const {color, intensity, width, height} = config
                const lightItem = new RectAreaLight(color, intensity, width, height)
                setPosition(lightItem)
                setRotation(lightItem)
                return lightItem
            }
        }
    }

}