import { Injectable } from '@angular/core';

Injectable()
export class Globals {

    public static width: number = window.innerWidth + ((window.innerWidth >= 960) ? -225 : -25);
    public static height: number = window.innerHeight - 150;
    public static scaling: number = 20;//Math.ceil((1520 * 20) / Globals.width);
}
export type position = { x: number, y: number };