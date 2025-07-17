import type * as Geometry from "./types";
import {BoxGeometry} from "three";
import {Types} from "./types";

export class GeometryInterface {
    constructor(public config: Geometry.Config) {

    }

    getGeometry(config: Geometry.Config): Geometry.GeometryItem {
        switch (config.type) {
            case Types.BOX_GEOMETRY: {
                const {width, height, depth} = config;
                return new BoxGeometry(width, height, depth);
            }
        }
    }

    get geometry(): Geometry.GeometryItem {
        return this.getGeometry(this.config)
    }
}