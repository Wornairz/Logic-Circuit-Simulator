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
        this.height = Globals.spazio_linee * numero_quadrati;
        this.width = this.normalizzaLarghezza();
        this.input = Array();
        this.posizione = posizione;
        this.output = new Pin({ x: this.width / Globals.spazio_linee, y: this.height / Globals.spazio_linee / 2 });
    }
    public addInput(relativeX: position, relativeY: position) {
        const punto = { x: relativeX, y: relativeY };
        this.input.push(new Pin(punto));
    }

    private normalizzaLarghezza() {
        // Si imposta il valore della larghezza in multipli di spazio_linee
        let larghezza = (this.immagine.width / this.immagine.height) * this.height;
        const eccesso = larghezza % Globals.spazio_linee;
        larghezza = larghezza - eccesso + (eccesso > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0);
        return larghezza;
    }

    public collide(x: number, y: number) {
        if (x >= this.posizione.x && x <= this.posizione.x + this.width) {
            return (y >= this.posizione.y && y <= this.posizione.y + this.height);
        }
    }
    public updatePosition(newPos: position) {
        if (newPos.x >= 0 && newPos.x + this.width <= Globals.width)
            this.posizione.x = newPos.x;
        if (newPos.y >= 0 && newPos.y + this.height <= Globals.height)
            this.posizione.y = newPos.y;
    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.drawImage(this.immagine, this.posizione.x, this.posizione.y, this.width, this.height);

        // Si scorre l'array degli input, per alcuni componenti possono essercene più di 2/3
        this.input.forEach((input) => {
            input.drawInComponent(context, this.posizione);
        });

        this.output.drawInComponent(context, this.posizione);
        context.stroke();
    }


}
