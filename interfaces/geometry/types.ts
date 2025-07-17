import type {BoxGeometry} from "three";

export enum Types {
    BOX_GEOMETRY = 'BOX_GEOMETRY',
}

export type Config = BoxConfig

export interface BoxConfig {
    type: Types.BOX_GEOMETRY
    width: number
    height: number
    depth: number
}

export type GeometryItem = BoxGeometry