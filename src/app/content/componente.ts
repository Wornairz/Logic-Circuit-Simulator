import { Globals, position } from '../globals';

export class Componente {
    public posizione: position;
    public width: number;
    public height: number;
    private alive: boolean = true;
    public immagine: HTMLImageElement;
    public type: string;

    constructor(numero_quadrati: number, type: string, posizione: position) {
        this.immagine = new Image();
        this.immagine.src = '/assets/' + type + '.svg';
        this.height = numero_quadrati;
        this.width = this.normalizzaLarghezza();
        this.posizione = posizione;
        this.type = type;
    }

    private normalizzaLarghezza() {
        // Si imposta il valore della larghezza in multipli di spazio_linee
        let larghezza = (this.immagine.width / this.immagine.height) * this.height;
        return Math.round(larghezza);
    }

    public getWidth() {
        return this.width * Globals.scaling;
    }
    public getHeight() {
        return this.height * Globals.scaling;
    }

    public collide(x: number, y: number) {
        if (x >= this.posizione.x && x <= this.posizione.x + this.width) {
            return (y >= this.posizione.y && y <= this.posizione.y + this.height);
        }
    }
    public updatePosition(newPos: position) {
        if (newPos.x >= 0 && newPos.x + this.width <= Math.round(Globals.width / Globals.scaling))
            this.posizione.x = newPos.x;
        if (newPos.y >= 0 && newPos.y + this.height <= Math.round(Globals.height / Globals.scaling))
            this.posizione.y = newPos.y;
    }

    public equals(component: Componente) {
        return (this.posizione.x === component.posizione.x && this.posizione.y === component.posizione.y);

    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.drawImage(this.immagine, this.posizione.x * Globals.scaling, this.posizione.y * Globals.scaling, this.width * Globals.scaling, this.height * Globals.scaling);
        context.stroke();
    }

    public kill() {
        this.alive = false;
    }

    public isAlive() {
        return this.alive;
    }



}
