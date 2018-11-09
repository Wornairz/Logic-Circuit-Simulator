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
        this.output = { x: this.posizione.x + this.width, y: this.posizione.y + 2 * Globals.spazio_linee };
    }
    public setInput(relativeX, relativeY) {
        let punto = { x: this.posizione.x + relativeX * Globals.spazio_linee, y: this.posizione.y + relativeY * Globals.spazio_linee };
        this.input.push(punto);
    }

    private normalizzaLarghezza() {
        // Si imposta il valore della larghezza in multipli di spazio_linee
        let larghezza = (this.immagine.width / this.immagine.height) * this.height;
        let eccesso = larghezza % Globals.spazio_linee;
        larghezza = larghezza - eccesso + (eccesso > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0);
        return larghezza;
    }

    public collide(x: number, y: number) {
        if (x >= this.posizione.x && x <= this.posizione.x + this.width)
            return (y >= this.posizione.y && y <= this.posizione.y + this.height);
    }
}