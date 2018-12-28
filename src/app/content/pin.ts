import { Globals, position } from '../globals';

export class Pin {

    public posizione: position;
    public static size: number = Globals.spazio_linee / 4;
    public static colore: string = '#0066ffa0';
    public static spessore: number = 3;

    constructor(posizione) {
        this.posizione = posizione;
    }


    public draw(context: CanvasRenderingContext2D) {
        context.strokeStyle = Pin.colore;
        context.fillStyle = Pin.colore;
        context.lineWidth = Pin.spessore;
        context.rect(this.posizione.x - Pin.size / 2, this.posizione.y - Pin.size / 2, Pin.size, Pin.size);
        context.fill();
    }

    public drawInComponent(context: CanvasRenderingContext2D, parentPosition: position) {
        const absolutePosition = this.absolutePosition(parentPosition);
        context.strokeStyle = Pin.colore;
        context.fillStyle = Pin.colore;
        context.lineWidth = Pin.spessore;
        context.rect(absolutePosition.x - Pin.size / 2, absolutePosition.y - Pin.size / 2, Pin.size, Pin.size);
        context.fill();
    }

    public absolutePosition(parentPosition: position) {
        return {
            x: parentPosition.x + this.posizione.x * Globals.spazio_linee,
            y: parentPosition.y + this.posizione.y * Globals.spazio_linee
        };
    }
}
