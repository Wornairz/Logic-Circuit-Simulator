import { Globals } from '../globals';

export class Componente {
    public posizione: { x: number, y: number };
    public width: number;
    public height: number;
    public input: Array<any>;
    public output: { x: number, y: number };
    public immagine: HTMLImageElement;

    constructor(numero_quadrati: number, percorso: string, posizione) {
        this.immagine = new Image();
        this.immagine.src = percorso;
        this.height = Globals.spazio_linee * numero_quadrati;
        this.width = this.normalizzaLarghezza();
        this.input = Array();
        this.posizione = posizione;
        this.output = { x: this.width / Globals.spazio_linee, y: 2 };
    }
    public setInput(relativeX, relativeY) {
        const punto = {x: relativeX, y: relativeY};
        this.input.push(punto);
    }
    public absolutePosition(relativePosition) {
        const punto = { x: this.posizione.x + relativePosition.x * Globals.spazio_linee,
                      y: this.posizione.y + relativePosition.y * Globals.spazio_linee };
        return punto;
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
}
