import type {Scene} from "three";
import type {Config, ObjItem} from "../object/types";
import {ObjInterface} from "../object";

export class SceneInterface {
    public scene: Scene
    constructor(scene: Scene) {
        this.scene = scene;
    }

    addObject(objectConfig: Config): ObjItem {
        const objInterface = new ObjInterface(objectConfig);
        const objItem = objInterface.objItem
        this.scene.add(objItem)
        return objItem
    }
}