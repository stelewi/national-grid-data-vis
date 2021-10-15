import {Group, MeshBasicMaterial, MeshPhysicalMaterial, Color, MeshStandardMaterial} from "three";

export default class Series {
    constructor(typeId, color) {
        this.typeId = typeId;
        this.dataPoints = {};
        this.group = new Group();
        this.material = new MeshStandardMaterial( {
            // color: 0x2317ad,
            color: color
            // opacity: 0.85,
            // transparent: false,

        });
        this.show = false;
        this._color = color;
    }

    /**
     * hex code - e.g. "#FFEE12"
     * @param {string} value
     */
    set color(value) {
        this.material.color = new Color(value);
        this._color = value;
    }

    /**
     *
     * @param {DataPoint} dataPoint
     */
    addDataPoint(dataPoint)
    {
        this.dataPoints[dataPoint.index] = dataPoint;
        this.group.add(dataPoint.mesh);
    }

    /**
     *
     * @param {number} unixTime
     * @returns {null|DataPoint}
     */
    getDataPoint(index)
    {
        if(this.dataPoints[index] === undefined)
        {
            return null;
        }

        return this.dataPoints[index];
    }
}