import type * as Geometry from "./types";
import { BoxGeometry } from "three";
import type {GeometryItem} from "./types";
import { Types} from "./types";

export class GeometryInterface {
    constructor(private config: Geometry.Config) {
        if (!config) {
            throw new Error("Geometry config is required");
        }
    }

    private createGeometry(): GeometryItem {
        switch (this.config.type) {
            case Types.BOX_GEOMETRY: {
                const { width = 1, height = 1, depth = 1 } = this.config;
                return new BoxGeometry(width, height, depth);
            }
            default:
                throw new Error(`Unsupported geometry type: ${this.config.type}`);
        }
    }

    get geometry(): GeometryItem {
        return this.createGeometry();
    }
}