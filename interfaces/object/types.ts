import type {Mesh} from "three";
import type {ObjInterface} from "./index";
import type {Config as GeometryConfig} from "../geometry/types";
import type {Config as MaterialConfig} from "../material/types";
import type {SceneInterface} from "../scene";

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
    sceneActions: SceneInterface
}

export interface ObjItem extends Mesh {
    userData: UserDataCustom
}
