import { CanvasComponent } from "src/app/canvas/canvas.component";
import { Vector2 } from "./Vector2";
import { Entity } from "./Entity";
import { Collision } from "src/_types/basic";

export class WallSegment extends Entity{
    start: Vector2;
    end: Vector2;
    firmness: number;
    normal: Vector2;

    constructor(private canvas: CanvasComponent, options: WallSegmentOptions) {
        super();

        this.start = options.start;
        this.end = options.end;
        this.firmness = options.firmness;

        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const length = Math.sqrt(dx*dx + dy*dy);
        this.normal = new Vector2(dy/length, -dx/length);
    }

    draw() {
        let ctx = this.canvas.ctx;
        ctx.lineTo(this.end.x, this.end.y);

        // Draw normal line
        let midPoint = new Vector2((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
        let normalPoint = midPoint.add(this.normal.multiply(20)); // Adjust 20 for desired length of normal line

        ctx.moveTo(midPoint.x, midPoint.y);
        ctx.lineTo(normalPoint.x, normalPoint.y);

        ctx.moveTo(this.end.x, this.end.y);
    }

    reverse(): void {
        [this.start, this.end] = [this.end, this.start];
        this.normal.negate();
    }

    lineIntersects(
        line: [Vector2, Vector2]
    ): Vector2 | null {
        let [s, e] = line;
        let [s2, e2] = [this.start, this.end];

        const tA = ((s2.y-e2.y)*(s.x-s2.x) + (e2.x-s2.x)*(s.y-s2.y)) / ((e2.x-s2.x)*(s.y-e.y) - (s.x-e.x)*(e2.y-s2.y));
        const tB = ((s.y-e.y)*(s.x-s2.x) + (e.x-s.x)*(s.y-s2.y)) / ((e2.x-s2.x)*(s.y-e.y) - (s.x-e.x)*(e2.y-s2.y));

        // allowing tB to be outside of [0,1] allows us to have intersection even beyond wall segment ends.
        if(tA >= 0 && tA <= 1) {
            return new Vector2(s.x + tA * (e.x - s.x), s.y + tA * (e.y - s.y))
        }

    return null;
    }
}

export class Wall extends Entity {
    segments: Array<WallSegment>;
    firmness: number = 100;

    constructor(private canvas: CanvasComponent, options: WallOptions) {
        super();
        if(options.firmness) this.firmness = options.firmness;
        this.segments = options.segments.map((s) => {
            return new WallSegment(canvas, Object.assign(s, {firmness: this.firmness}));
        });

        
        

        // for(let i=0; i<this.segments.length-1; i++) {
        //     const currentEnd = this.segments[i].end;
        //     for(let j=i+1; j<this.segments.length; j++) {
        //         if (this.segments[j].start.equals(currentEnd)) { // Segment already in correct place and orientation
        //             continue; 
        //         } 
        //         if (this.segments[j].end.equals(currentEnd)) { // Segment needs to be reversed
        //              this.segments[j].reverse();
        //         } 
        //         // Otherwise segment needs to be moved to next in line (swap places)
        //         else {
        //             [this.segments[i+1], this.segments[j]] = [this.segments[j], this.segments[i + 1]];
        //         }
        //     }
        // }

        console.log(this.segments);
    }

    override draw() {
        let ctx = this.canvas.ctx;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 5;
        let first = this.segments[0];
        ctx.moveTo(first.start.x, first.start.y);
        ctx.beginPath();
        this.segments.forEach(seg => {
            seg.draw();
        });
        ctx.closePath();
        ctx.stroke();
    }

    getCollision(line: [Vector2, Vector2]): Array<[Vector2, WallSegment]> {
        let collisions: Array<[Vector2, WallSegment]> = [];
        for(let s of this.segments) {
            let collisionPoint = s.lineIntersects(line);
            if(collisionPoint) {
                collisions.push([collisionPoint, s]);
            }
        }
        return collisions;
    }
}

export interface WallOptions {
    segments: Array<Omit<WallSegmentOptions, 'firmness'>>;
    firmness?: number;
}

export interface WallSegmentOptions {
    start: Vector2;
    end: Vector2;
    firmness: number;
}