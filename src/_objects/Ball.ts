import { CanvasComponent } from "src/app/canvas/canvas.component";
import { Vector2 } from "./Vector2";
import { Config } from 'src/_objects/Config';
import { BallType } from "src/_types/basic";

export class Ball {
    radius = Config.radius;
    position: Vector2;
    velocity = new Vector2(0, 0);
    color!: string;
    number!: number;
    type!: BallType;

    constructor(private canvas: CanvasComponent, options: BallOptions, ) {
        this.position = options.position;
        if(options.velocity) this.velocity = options.velocity;
        this.color = options.color;
        this.number = options.number;
        this.type = options.type;
    }

    update() {
        // this.position = this.position.add(1, 0);

        // let v = this.velocity.multiply(this.canvas.time.deltaTime / 1000)
        // console.log(this.canvas.time.deltaTime / 1000 , this.canvas.time.deltaTime);
        if(Math.abs(this.velocity.x) < Config.velocityStopLimit && Math.abs(this.velocity.y) < Config.velocityStopLimit) this.velocity = new Vector2(0, 0); 
        this.velocity = this.velocity.subtract(this.velocity.multiply(Config.drag / 100000));
        let move = this.velocity.multiply(this.canvas.time.deltaTime/ 1000);
        if(this.position.x + this.radius + move.x > Config.canvasWidth || this.position.x - this.radius + move.x < 0) this.velocity.x *= -.85;
        if(this.position.y + this.radius + move.y > Config.canvasHeight || this.position.y - this.radius + move.y < 0) this.velocity.y *= -.85;
        this.position = this.position.add(this.velocity.multiply(20 / 1000));
        // this.position = this.position.add(this.velocity.multiply(this.canvas.time.deltaTime/ 1000));
    }


    draw() {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.strokeStyle = this.color;
        this.canvas.ctx.fillStyle = this.color;
        this.canvas.ctx.arc(this.position.x, this.position.y, Config.radius, 0, 2 * Math.PI);
        this.canvas.ctx.closePath();
        this.canvas.ctx.textAlign = 'center';
        if(this.type == 'solid') {
            this.canvas.ctx.fill();
            this.canvas.ctx.fillStyle = 'black';
            this.canvas.ctx.fillText(this.number.toString(), this.position.x, this.position.y + 4);
        } else {
            this.canvas.ctx.fill();
            this.canvas.ctx.fillStyle = 'black';
            this.canvas.ctx.fillText(this.number.toString(), this.position.x, this.position.y + 4);
        }
    }
}

interface BallOptions {
    position: Vector2;
    velocity?: Vector2;
    color: string;
    type: BallType;
    number: number;
}