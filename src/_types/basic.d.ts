import { Entity } from "src/_objects/Entity";
import { Vector2 } from "src/_objects/Vector2";

export type BallType = 'solid' | 'stripe' | 'eight' | 'cue';

export interface Collision {
    entity: Entity;
    point: Vector2;
  }