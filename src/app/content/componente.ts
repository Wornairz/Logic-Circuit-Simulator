import { Globals, position } from '../globals';
import { Pin } from './pin';

export class Componente {
    public posizione: position;
    public width: number;
    public height: number;
    public input: Array<Pin>;
    public output: Pin;
    public immagine: HTMLImageElement;

    constructor(numero_quadrati: number, percorso: string, posizione: position) {
        this.immagine = new Image();
        this.immagine.src = percorso;
        this.height = numero_quadrati;
        this.width = this.normalizzaLarghezza();
        this.input = Array();
        this.posizione = posizione;
        this.output = new Pin({ x: this.width, y: this.height / 2 }, this.posizione);
    }
    public addInput(relativeX: number, relativeY: number) {
        let temp = new Pin({ x: relativeX, y: relativeY }, this.posizione);
        this.input.push(temp);
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

        this.input.forEach((input) => {
            input.updatePosition();
        });
        this.output.updatePosition();
    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.drawImage(this.immagine, this.posizione.x * Globals.scaling, this.posizione.y * Globals.scaling, this.width * Globals.scaling, this.height * Globals.scaling);

        // Si scorre l'array degli input, per alcuni componenti possono essercene più di 2/3
        this.input.forEach((input) => {
            input.draw(context);
        });

        this.output.draw(context);
        context.stroke();
    }



}
