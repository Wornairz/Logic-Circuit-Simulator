import { Globals, position } from '../globals';

export class Pin {
    public next: Array<Pin>;
    public posizione: position;
    public relativePosition: position = null;
    public parentPosition: position = null;
    public colore: string = '#0066ffa0';
    public static size: number = 0.4;
    public static spessore: number = 0.1;

    constructor(posizione: position, parentPosition?: position) {
        if (parentPosition != null) { //Colpa di typescript che non ha l'overloading
            this.relativePosition = posizione;
            this.parentPosition = parentPosition;
            this.updatePosition();
        }
        else this.posizione = posizione;
    }

    public updatePosition() {
        this.posizione = {
            x: this.parentPosition.x + this.relativePosition.x,
            y: this.parentPosition.y + this.relativePosition.y
        };
    }

    public connect(){
        this.colore = "#24e5c1e0";
    }

    public isConnected(){
        return (this.colore === "#24e5c1e0");
    }
    public isConnectedTo(punto: Pin) {
        return (this.posizione.x === punto.posizione.x && this.posizione.y === punto.posizione.y);
    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.strokeStyle = this.colore;
        context.lineWidth = Pin.spessore;
        context.fillStyle = this.colore;
        context.rect((this.posizione.x - Pin.size / 2) * Globals.scaling, (this.posizione.y - Pin.size / 2) * Globals.scaling, Pin.size * Globals.scaling, Pin.size * Globals.scaling);
        context.fill();
    }



}


