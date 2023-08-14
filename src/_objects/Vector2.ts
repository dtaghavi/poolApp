export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getNewPos(angle: number, distance: number): Vector2 {
        let radian = angle * Math.PI / 180;

        return new Vector2(
            (distance * Math.cos(radian)) + this.x,
            (distance * Math.sin(radian)) + this.y);
    }

    add(vOrX: Vector2 | number, y?: number): Vector2 {
        if(typeof vOrX == 'number') {
            if(y !== undefined) {
                return new Vector2(this.x + vOrX, this.y + y);
            } else return this
        } else {
            return new Vector2(this.x + vOrX.x, this.y + vOrX.y);
        }
    }

    subtract(vOrX: Vector2 | number, y?: number): Vector2 {
        if(typeof vOrX == 'number') {
            if(y !== undefined) {
                return new Vector2(this.x - vOrX, this.y - y);
            } else return this
        } else {
            return new Vector2(this.x - vOrX.x, this.y - vOrX.y);
        }
    }

    multiply(v: Vector2 | number): Vector2 {
        if(typeof v == 'number') {
            return new Vector2(this.x * v, this.y * v);
        } else {
            return new Vector2(this.x * v.x, this.y * v.y);
        }
    }

    divide(v: Vector2 | number): Vector2 {
        if(typeof v == 'number') {
            return new Vector2(this.x / v, this.y / v);
        } else {
            return new Vector2(this.x / v.x, this.y / v.y);
        }
    }

    // calculate the length (or magnitude) of the vector
    magnitude(): number {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    // normalize the vector (make it have a magnitude of 1 but keep its direction)
    normalize(): Vector2 {
        const mag = this.magnitude();
        return new Vector2(this.x / mag, this.y / mag);
    }

    // scale up/down the vector with a specific value
    scale(factor: number): Vector2 {
        return new Vector2(this.x * factor, this.y * factor);
    }

    negate(): Vector2 {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    reflectNormal(normal: Vector2) {
        let V = this
        return V.subtract(normal.multiply(2 * V.getDotProduct(normal)))
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
        let result = radian * 180 / Math.PI;
        console.log("Result: ", result);
        
        return result;
    }

    getRadian(pos2: Vector2) {
        let dx = pos2.x - this.x;
        let dy = pos2.y - this.y; 
        return Math.atan2(dy, dx);
    }

    getDotProduct(vector: Vector2): number {
        return this.x * vector.x + this.y * vector.y;
    }

    findLine(lineEnd: Vector2, point: Vector2): Vector2 | null {
        let dx = lineEnd.x - this.x;
        let dy = lineEnd.y - this.y;
        let d2 = dx**2 + dy**2;
        let nx = ((point.x - this.x)*dx + (point.y - this.y)*dy) / d2;
        let result = new Vector2(dx * nx + this.x, dy * nx + this.y);

        // Calculate vectors for dot product
        let vectorA = new Vector2(result.x - this.x, result.y - this.y);
        let vectorB = new Vector2(lineEnd.x - this.x, lineEnd.y - this.y);

        // calculate dot product
        let dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y; 

        // Check if nx lies between 0-1 range (on the segment) & vectors' dot product > 0:
        if(nx >= 0 && nx <= 1 && dotProduct > 0) {
            return result;
        } else {
            return null; 
        }
    }

    distanceBetweenPoints(pos2: Vector2): number {
        return Math.sqrt((pos2.x - this.x)**2 +(pos2.y - this.y)**2);
    }

    equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    isOnLine(A: Vector2, B: Vector2): boolean {
        const crossProduct = (this.y - A.y) * (B.x - A.x) - (this.x - A.x) * (B.y - A.y);

        // If cross product is not zero, then point is not on the line.
        if (Math.abs(crossProduct) !== 0)
            return false;

        const dotProduct = (this.x - A.x) * (B.x - A.x) + (this.y - A.y)*(B.y - A.y);

        // If dot product is negative, then point is not between A and B.
        if (dotProduct < 0)
            return false;

        const squaredLengthBA = (B.x - A.x)*(B.x - A.x) + (B.y - A.y)*(B.y - A.y);
        
        // If dot product is more than square of distance from A to B,
        // that means point is out of range. 
        if (dotProduct > squaredLengthBA)
            return false;

        return true;
    }

    from(array: [number, number]): Vector2
    from(position: Position): Vector2
    from(x: number, y: number ): Vector2
    from(xPosArr: number | Position | [number, number], y?: number ): Vector2 {
        switch(typeof xPosArr) {
            case 'number':
                if(y == undefined) return new Vector2(0,0);
                return new Vector2(xPosArr, y);
            case 'object':
                if(Array.isArray(xPosArr)) return new Vector2(...xPosArr);
                return new Vector2(xPosArr.x, xPosArr.y);
            default:
                return new Vector2(0,0);
        }
    }
}

const vector2 = new Vector2(0,0);
export default vector2;

export interface Position {
    x: number;
    y: number;
}

interface LineEquation {
    m: number;
    b: number;
}