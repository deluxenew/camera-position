import {Mesh} from "three";
import type * as OBJ from "./types";
import type {Config as GeometryConfig, GeometryItem} from "../geometry/types";
import type {Config as MaterialConfig, MaterialItem} from "../material/types";

import {GeometryInterface} from "../geometry";
import {MaterialInterface} from "../material";


export class ObjInterface {
    constructor(public objConfig: OBJ.Config) {

    }

    get objItem(): OBJ.ObjItem {
        return this.setObjItem(this.objConfig);
    }

    getGeometry(geometryConfig: GeometryConfig): GeometryItem {
        const geometryInterface = new GeometryInterface(geometryConfig)
        return geometryInterface.geometry
    }

    setMaterial(materialConfig: MaterialConfig): MaterialItem {
        const materialInstance = new MaterialInterface(materialConfig)
        return materialInstance.material
    }

    setObjItem(objConfig: OBJ.Config): OBJ.ObjItem {
        const geometry = this.getGeometry(objConfig.geometryConfig)
        const material = this.setMaterial(objConfig.materialConfig)
        return new Mesh(geometry, material)
    }
}