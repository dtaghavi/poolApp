import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Ball } from 'src/_objects/Ball';
import vector2, { Vector2 } from 'src/_objects/Vector2';
import { Config, BallTypes } from 'src/_objects/Config';


import { Observable, fromEvent } from 'rxjs';
import { skipUntil, takeUntil } from 'rxjs/operators';
import { Renderer2 } from '@angular/core';
import { RESTORED_VIEW_CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { Entity } from 'src/_objects/Entity';
import { Wall, WallSegment } from 'src/_objects/Wall';
import { Collision } from 'src/_types/basic';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;
  entities: Array<Entity> = [];
  config = Config;
  stop = false;
  time = {
    now: new Date().getTime(),
    last: 0,
    deltaTime: 60
  };

  mousedown$: any;
  mouseup$: any;
  sub: any;
  mouseX!: number;
  mouseY!: number;


  cueBall!: Ball;

  constructor() {
  }

  ngOnInit(): void {
    let ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
    } else {
      console.log("Error initializing canvas");
    }
  }


  initializeGame(): void {
    let counter = 0;
    let offSet = new Vector2(0, 0).getNewPos(-30, Config.radius * 2);
    // Create 15 balls: 1 - 7 solids, 8 - 15 stripes

    // let v =new Vector2(10, 10).getNewPos(-30, Config.radius * 2);
    // this.ctx.beginPath();
    // this.ctx.moveTo(10, 10);
    // this.ctx.lineTo(v.x, v.y);
    // this.ctx.stroke(); 
    // console.log("Tetserino:", v);

    let prevStartPos = new Vector2((this.config.canvasWidth - (this.config.radius * 10)), this.config.canvasHeight / 2);
    let d = Config.radius * 2;

    // Print for full board
    // for(let i = 1; i <= 5; i++) {
    //   for(let k = 0; k < i; k++) {
    //     this.entities.push(new Ball(this, {
    //       position: new Vector2(prevStartPos.x, prevStartPos.y + (d * k)),
    //       color: BallTypes[counter].color,
    //       type: BallTypes[counter].type,
    //       number: BallTypes[counter].number
    //     }));
    //     counter++;
    //   }
    //   prevStartPos = prevStartPos.add(offSet);
    // }
    this.cueBall = new Ball(this, {
      position: vector2.from(Config.canvasWidth / 2, Config.canvasHeight / 2),
      color: 'white',
      type: 'cue',
      number: 0
    });

    this.entities.push(this.cueBall);

    this.entities.push(new Ball(this, {
      position: vector2.from(Config.canvasWidth - 60, Config.canvasHeight / 2),
      color: BallTypes[11].color,
      type: BallTypes[11].type,
      number: BallTypes[11].number
    }))


    this.entities.push(new Ball(this, {
      position: vector2.from(85, Config.canvasHeight - 30),
      color: BallTypes[2].color,
      type: BallTypes[2].type,
      number: BallTypes[2].number
    }))

    this.entities.push(new Ball(this, {
      position: vector2.from(250, 40),
      color: BallTypes[5].color,
      type: BallTypes[5].type,
      number: BallTypes[5].number
    }))

    this.entities.push(new Ball(this, {
      position: vector2.from(Config.canvasWidth - 400, Config.canvasHeight / 2 - 40),
      color: BallTypes[5].color,
      type: BallTypes[5].type,
      number: BallTypes[5].number
    }))

    let offsetX = 10;
    let offsetY = 10;

    this.entities.push(new Wall(this, {
      segments: [{
            end: new Vector2(offsetX, offsetY),
            start: new Vector2(Config.canvasWidth - offsetX, offsetY)
        }, {
            end: new Vector2(Config.canvasWidth - offsetX, offsetY),
            start: new Vector2(Config.canvasWidth - offsetX, Config.canvasHeight - offsetY)
        }, {
            end: new Vector2(Config.canvasWidth - offsetX, Config.canvasHeight - offsetY),
            start: new Vector2(offsetX, Config.canvasHeight - offsetY)
        }, {
            end: new Vector2(offsetX, Config.canvasHeight - offsetY),
            start: new Vector2(offsetX, offsetY)
        }],
        firmness: 80
    }))

    console.log(this.entities);
    

    this.mousedown$ = fromEvent(this.ctx.canvas, 'mousedown');
    this.mouseup$ = fromEvent(this.ctx.canvas, 'mouseup');
    this.mouseup$.subscribe((_: any) => {
      this.register();
    });
    this.mousedown$.subscribe((_: any) => {
      console.log('clicked');
    });
    this.register();

    this.update();
  }

  register() {
    try {
      this.sub.unsubscribe();
    } catch (err) {
    } finally {
    }

    let mousemove$ = fromEvent<MouseEvent>(this.ctx.canvas, 'mousemove');
    mousemove$ = mousemove$.pipe(skipUntil(this.mousedown$));
    mousemove$ = mousemove$.pipe(takeUntil(this.mouseup$));
    this.sub = mousemove$.subscribe((e: MouseEvent) => {
      
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;  
    });
  }

  addBall(): void {
    this.entities.push(new Ball(this, {
      position: vector2.from(30, Config.canvasHeight / 2),
      velocity: vector2.from(1000, 500),
      color: 'white',
      type: 'cue',
      number: 0
    }))
  }

  update() {
    if (this.stop) return;
    this.time.now = new Date().getTime();
    for (let e of this.entities) {
      e.update?.call(e);
    }
    this.draw();
    if (this.time.last) this.time.deltaTime = this.time.now - this.time.last;
    this.time.last = this.time.now;
    window.requestAnimationFrame(this.update.bind(this))
  }

  draw() {
    this.ctx.clearRect(0, 0, Config.canvasWidth, Config.canvasHeight);
    for (let e of this.entities) {
      e.draw()
    }

    let oldPos = this.cueBall.position
    let angle = oldPos.getAngle(new Vector2(this.mouseX, this.mouseY));
    let newPos = oldPos.getNewPos(angle, 10000);
    let bounces = 4;
    let at = 1;

    let imagineCollision = (oldPos: Vector2, newPos: Vector2) => {
      let collisions: Collision[] = [];

      for(let e of this.entities) {
        if(e == this.cueBall) continue;
        switch(e.constructor.name) {
          case 'Ball':
            let ball = <Ball>e;
            let ballpoint = oldPos.findLine(newPos, ball.position);
            if( ballpoint && ball.position.distanceBetweenPoints(ballpoint) <= this.cueBall.radius + ball.radius) {
              let distanceA = ball.position.distanceBetweenPoints(ballpoint);
              let distanceC = this.cueBall.radius + ball.radius;
              let distanceB = Math.sqrt(distanceC**2 - distanceA**2);

              let movementDir = newPos.subtract(oldPos).normalize();
              let imaginaryCollisionPoint = ballpoint.subtract(movementDir.multiply(distanceB));
              this.drawPoint(imaginaryCollisionPoint);

              collisions.push({
                entity: e,
                point: imaginaryCollisionPoint
              })
            }
            break;
          case 'Wall':
            let wall = <Wall>e;
            let wallCollision = wall.getCollision([oldPos, newPos]);
            for(let collision of wallCollision) {
              let [wallpoint, segment] = collision;
              
              let movementDir = newPos.subtract(oldPos).normalize();
              // let wallVector = segment.start.subtract(segment.end).normalize();
              let wallVector = segment.end.subtract(segment.start).normalize();
              let dot = wallVector.getDotProduct(movementDir);
              let angleWithWall = Math.acos(dot);
              
              // Calculating the hypotenuse using sine law
              let imaginaryCollisionDistance = this.cueBall.radius / Math.sin(angleWithWall);

              // Calculating new position by adding calculated length in direction of initial movement direction
              let imaginaryCollisionPoint = wallpoint.subtract(movementDir.multiply(imaginaryCollisionDistance));
              this.drawPoint(imaginaryCollisionPoint);

              collisions.push({
                entity: segment,
                point: imaginaryCollisionPoint
              });
            }
            break;
        }
      }

      if(collisions.length) {
        if(collisions?.length > 1 ) {
          collisions.sort((a, b) => {
            let aD = oldPos.distanceBetweenPoints(a.point);
            let bD = oldPos.distanceBetweenPoints(b.point);
    
            return aD - bD;
          })
        }

        let firstCollision = collisions[0];
        
        this.drawLine(oldPos, firstCollision.point);
        this.drawPoint(firstCollision.point);
        this.drawCircle(firstCollision.point, this.cueBall.radius);

        switch(firstCollision.entity.constructor.name) {
          case 'Ball':
            let ball = <Ball>firstCollision.entity;
            
            let V1 = firstCollision.point.subtract(oldPos);  // velocity vector of cueBall before collision

            // calculate unit normal and unit tangent directions
            let n = ball.position.subtract(firstCollision.point);
            let un = n.normalize(); 

            // project velocities onto unit normal and unit tangent directions
            let v1n = un.getDotProduct(V1); 
            let v1VisualizeBeforeZeroOut = un.multiply(v1n).multiply(-1);
            
            this.drawLine(ball.position, ball.position.add(v1VisualizeBeforeZeroOut.negate()));
            let newBV = V1.reflectNormal(v1VisualizeBeforeZeroOut.normalize()).normalize();

            // this.drawLine(firstCollision.point, );
            let newBallPoint = firstCollision.point.add(newBV.multiply(10000));
            if(at < bounces) {
              at = bounces;
              imagineCollision(firstCollision.point, newBallPoint)
            }
            break;
          case 'WallSegment':
            let wall = <WallSegment>firstCollision.entity;

            let V = firstCollision.point.subtract(oldPos)
            let newV = V.reflectNormal(wall.normal).normalize();

            let newPoint = firstCollision.point.add(newV.multiply(10000))
            
            // this.drawLine(firstCollision.point, firstCollision.point.add(newV))
            if(at < bounces) {
              at++;
              imagineCollision(firstCollision.point, newPoint)
            }
            break;
        }
        // let 
      }
    }

    imagineCollision(oldPos, newPos);
  }

  drawLine(v1: Vector2, v2: Vector2) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 5; // width of the line
    this.ctx.strokeStyle = 'black'; // color of the line
    this.ctx.moveTo(v1.x, v1.y); // begins a path from the white balls position
    this.ctx.lineTo(v2.x, v2.y); // used to create a pointer based on x and y of cursor
    this.ctx.stroke(); // this is where the actual drawing happens.
  }

  drawPoint(point: Vector2) { 
    this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        
        this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        this.ctx.closePath();

        this.ctx.fill();
  }

  drawCircle(point: Vector2, radius: number) { 
    this.ctx.beginPath();
        
        this.ctx.lineWidth = 3; // width of the line
        
        this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        this.ctx.closePath();
        // this.ctx.fill();
        this.ctx.stroke();
  }
}


