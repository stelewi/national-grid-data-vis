export default class DataPoint {
    constructor(index, unixTime, typeId, quantity, geometry, mesh) {
        this.index = index;
        this.unixTime = unixTime;
        this.typeId = typeId;
        this.quantity = quantity;
        this.geometry = geometry;
        this.mesh = mesh;
        this.tween = null;
    }
}