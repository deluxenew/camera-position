import type {Object3DEventMap, Object3D, Mesh} from "three";
import type {ObjInterface} from "./index";
import type { Config as GeometryConfig } from "../geometry/types";
import type { Config as MaterialConfig } from "../material/types";

export enum Types {

}

export interface Config {
    name: string;
    type: Types;
    geometryConfig: GeometryConfig
    materialConfig: MaterialConfig
}



export interface UserDataCustom {
    config: Config;
    actions: ObjInterface
}

export type ObjectItem = Mesh

export interface ObjItem extends ObjectItem {
    userData: UserDataCustom
}
