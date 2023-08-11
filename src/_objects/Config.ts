import { BallType } from "src/_types/basic"
import { Vector2 } from "./Vector2"

export const Config = {
    radius: 20,
    canvasHeight: 600,
    canvasWidth: 1200,
    drag: 500,
    velocityStopLimit: .001
}

export const BallTypes: Array<{
    color: string,
    type: BallType,
    number: number
}> = [
    {
        color: 'yellow',
        type: 'solid',
        number: 1,
    },
    {
        color: 'blue',
        type: 'solid',
        number: 2,
    },
    {
        color: 'blue',
        type: 'stripe',
        number: 10,
    },
    {
        color: 'red',
        type: 'stripe',
        number: 11
    },
    {
        color: 'black',
        type: 'eight',
        number: 8,
    },
    {
        color: 'red',
        type: 'solid',
        number: 3,
    },
    {
        color: 'purple',
        type: 'solid',
        number: 4,
    },
    {
        color: 'orange',
        type: 'stripe',
        number: 13
    },
    {
        color: 'orange',
        type: 'solid',
        number: 5,
    },
    {
        color: 'purple',
        type: 'stripe',
        number: 12
    },
    {
        color: 'green',
        type: 'stripe',
        number: 14
    },
    {
        color: 'maroon',
        type: 'solid',
        number: 7,
    },
    {
        color: 'yellow',
        type: 'stripe',
        number: 9,
    },
    {
        color: 'maroon',
        type: 'stripe',
        number: 15
    },
    {
        color: 'green',
        type: 'solid',
        number: 6,
    }
]