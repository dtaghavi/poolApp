import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Ball } from 'src/_objects/Ball';
import { Vector2 } from 'src/_objects/Vector2';
import { Config, BallTypes } from 'src/_objects/Config';


import { Observable, fromEvent } from 'rxjs';
import { skipUntil, takeUntil } from 'rxjs/operators';
import { Renderer2 } from '@angular/core';
import { RESTORED_VIEW_CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;
  entities: Array<Ball> = [];
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
      position: new Vector2(60, Config.canvasHeight / 2),
      color: 'white',
      type: 'cue',
      number: 0
    });

    this.entities.push(this.cueBall);

    this.entities.push(new Ball(this, {
      position: new Vector2(Config.canvasWidth - 60, Config.canvasHeight / 2),
      color: BallTypes[11].color,
      type: BallTypes[11].type,
      number: BallTypes[11].number
    }))


    this.entities.push(new Ball(this, {
      position: new Vector2(85, Config.canvasHeight - 30),
      color: BallTypes[2].color,
      type: BallTypes[2].type,
      number: BallTypes[2].number
    }))

    this.entities.push(new Ball(this, {
      position: new Vector2(250, 40),
      color: BallTypes[5].color,
      type: BallTypes[5].type,
      number: BallTypes[5].number
    }))

    this.entities.push(new Ball(this, {
      position: new Vector2(Config.canvasWidth - 400, Config.canvasHeight / 2 - 40),
      color: BallTypes[5].color,
      type: BallTypes[5].type,
      number: BallTypes[5].number
    }))

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
      position: new Vector2(30, Config.canvasHeight / 2),
      velocity: new Vector2(1000, 500),
      color: 'white',
      type: 'cue',
      number: 0
    }))
  }

  update() {
    if (this.stop) return;
    this.time.now = new Date().getTime();
    for (let e of this.entities) {
      e.update()
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

    let angle = this.cueBall.position.getAngle(new Vector2(this.mouseX, this.mouseY));
    let tan1 = this.cueBall.position.getNewPos(angle - 90, Config.radius - 1)
    let tan2 = this.cueBall.position.getNewPos(angle + 90, Config.radius - 1)

    let newPos = this.cueBall.position.getNewPos(angle, 1000);
    // let tanPos1 = tan1.getNewPos(angle, 1500)
    // let tanPos2 = tan2.getNewPos(angle, 1500)
    let collisions: Collision[] = [];

    for(let e of this.entities) {
      if(e == this.cueBall) continue;

      let point = this.cueBall.position.findLine(newPos, e.position);

      if(e.position.distanceBetweenPoints(point) <= Config.radius*2) collisions.push({
        entity: e,
        point
      });
    }

    if(collisions.length) {
      if(collisions?.length > 1 ) {
        collisions.sort((a, b) => {
          let aD = this.cueBall.position.distanceBetweenPoints(a.point);
          let bD = this.cueBall.position.distanceBetweenPoints(b.point);
  
          return aD > bD ? 1 : bD> aD ? -1 : 0;
        })
      } 

      let firstCollision = collisions[0];

      this.drawPoint(firstCollision.point)

      let distA = firstCollision.entity.position.distanceBetweenPoints(firstCollision.point);
      let distC = this.cueBall.radius + firstCollision.entity.radius;
      let distB;
      if(distA > 0) {
        distB = Math.sqrt(distC**2 - distA**2)
      } else {
        distB = distC;
      }
      
      let dist = this.cueBall.position.distanceBetweenPoints(firstCollision.point);

      let collisionDistance = dist - distB;
      let collisionPoint = this.cueBall.position.getNewPos(angle, collisionDistance);
      this.drawCircle(collisionPoint, this.cueBall.radius);
      this.drawPoint(collisionPoint)

      let cDx = collisionPoint.x - firstCollision.entity.position.x;
      let cDy = collisionPoint.y - firstCollision.entity.position.y;
      let dsq = cDx*cDx + cDy * cDy;
      let vel = collisionPoint.getNewPos(angle, 5);
      let DV = 2*(vel.x*cDx + vel.y*cDy)/ dsq;
      // if(DV>0)DV=0;
      let newVel = new Vector2(vel.x - DV * cDx, vel.y - DV * cDy);

      this.drawLine(collisionPoint, collisionPoint.add(newVel))
    }




    // let point = this.cueBall.position.findLine(newPos, this.entities[1].position);
    // this.drawPoint(point);
    this.drawLine(this.cueBall.position, newPos);
    // this.drawLine(tan1, tanPos1)
    // this.drawLine(tan2, tanPos2)
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

        this.ctx.stroke();
  }
}

interface Collision {
  entity: Ball;
  point: Vector2;
}
