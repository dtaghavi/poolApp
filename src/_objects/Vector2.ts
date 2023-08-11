export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getNewPos(angle: number, distance: number) {
        let radian = angle * Math.PI / 180;

        return new Vector2(
            (distance * Math.cos(radian)) + this.x,
            (distance * Math.sin(radian)) + this.y);
    }

    add(vOrX: Vector2 | number, y?: number) {
        if(typeof vOrX == 'number') {
            if(y != undefined) {
                return new Vector2(this.x + vOrX, this.y + y);
            } else return this
        } else {
            return new Vector2(this.x + vOrX.x, this.y + vOrX.y);
        }
    }

    subtract(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(v: Vector2 | number) {
        if(typeof v == 'number') {
            return new Vector2(this.x * v, this.y * v);
        } else {
            return new Vector2(this.x * v.x, this.y * v.y);
        }
    }

    /**
     * note: Given two points determine the angle from the horizontal axis
     * 
     * @param pos2 A second point
     * @returns the angle made between two points and the horizontal axis
     */
    getAngle(pos2: Vector2): number {
        let dx = pos2.x - this.x;
        let dy = pos2.y - this.y; 
        let radian = Math.atan2(dy, dx);
        let result = radian * 180 / Math.PI ;
        console.log("Result: ", result);
        
        return result;
    }

    findLine(pos2: Vector2, pos3: Vector2) {
        let dx = pos2.x - this.x;
        let dy = pos2.y - this.y;
        let d2 = dx**2 + dy**2;
        let nx = ((pos3.x - this.x)*dx + (pos3.y - this.y)*dy) / d2
        return new Vector2(dx * nx + this.x, dy*nx + this.y);
    }

    distanceBetweenPoints(pos2: Vector2): number {
        return Math.sqrt((pos2.x - this.x)**2 +(pos2.y - this.y)**2);
    }

}

interface LineEquation {
    m: number;
    b: number;
}