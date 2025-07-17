import type {Group, Mesh, Scene} from "three";
import type {Config } from "../object/types";
import {ObjInterface} from "../object";

export class SceneInterface {
    constructor(public scene: Scene) {

    }

    public sceneItems: Mesh[] = []

    updatePositions() {
        this.sceneItems.forEach((sceneItem: Mesh) => {
            sceneItem.userData.actions.setPosition()
        })
    }

    addMesh(objectConfig: Config, group: Group | Scene = this.scene): Mesh {
        const objInterface = new ObjInterface(objectConfig);
        const objItem = objInterface.objItem
        objItem.userData.sceneActions = this
        group.add(objItem)
        this.sceneItems.push(objItem)
        this.updatePositions()
        objItem.userData.actions.setAddAnimation()

        return objItem
    }

}