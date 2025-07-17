import type {Mesh, Scene} from "three";
import type {Config } from "../object/types";
import {ObjInterface} from "../object";

export class SceneInterface {
    public scene: Scene
    constructor(scene: Scene) {
        this.scene = scene;
    }

    addObject(objectConfig: Config): Mesh {
        const objInterface = new ObjInterface(objectConfig);
        const objItem = objInterface.objItem
        this.scene.add(objItem)
        return objItem
    }
}