import { position, Globals } from '../globals';

export class Wire {
    public posizione: position = { x: 0, y: 0 };
    public sorgente: position;
    public destinazione: position;
    public spessore = 0.125;
    public colore = '#000000';
    private alive: boolean = true;
    public spostamento_orizzontale: boolean;


    constructor(sorgente: position, destinazione: position) {
        this.sorgente = sorgente;
        this.destinazione = destinazione;
    }


    public collide(x: number, y: number): boolean {
        let a = this.sorgente.x;
        let b = this.destinazione.y;
        if (this.spostamento_orizzontale) {
            a = this.destinazione.x;
            b = this.sorgente.y;
        }
        if (x >= a - 2.5 * this.spessore && x <= a + 2.5 * this.spessore) {
            if ((y >= this.sorgente.y && y <= this.destinazione.y) || (y >= this.destinazione.y && y <= this.sorgente.y)) {
                return true;
            }
        } else if (y >= b - 2.5 * this.spessore && y <= b + 2.5 * this.spessore) {
            if ((x >= this.sorgente.x && x <= this.destinazione.x) || (x >= this.destinazione.x && x <= this.sorgente.x)) {
                return true;
            }
        } else { return false; }
    }

    public equals(wire: Wire) {
        if (wire.spostamento_orizzontale === this.spostamento_orizzontale && wire.sorgente.x === this.sorgente.x && wire.sorgente.y === this.sorgente.y)
            return (wire.destinazione.x === this.destinazione.x && wire.destinazione.y === this.destinazione.y);
    }

    public kill() {
        this.alive = false;
    }

    public isAlive() {
        return this.alive;
    }

    public undefinedState() {
        this.colore = "#FF0000";
        this.spessore = 0.125;
    }

    public falseState() {
        this.colore = "#000000";
        this.spessore = 0.125;
    }
    public trueState() {
        this.colore = "#000000";
        this.spessore = 0.200;
    }


    public draw(context: CanvasRenderingContext2D) {
        // Inizia un nuovo percorso
        context.beginPath();

        context.lineWidth = this.spessore * Globals.scaling;
        context.strokeStyle = this.colore;
        // Si inizia a disegnare dalle coordinate di sorgente...
        context.moveTo(this.sorgente.x * Globals.scaling, this.sorgente.y * Globals.scaling);
        // ... fino alle coordinate della x di destinazione (linea orizzontale)

        // Se lo spostamento tende verso destra, allora si disegna prima una linea orizzontale
        if (this.spostamento_orizzontale) {
            context.lineTo(this.destinazione.x * Globals.scaling, this.sorgente.y * Globals.scaling);
        } else {
            context.lineTo(this.sorgente.x * Globals.scaling, this.destinazione.y * Globals.scaling);
        }

        context.lineTo(this.destinazione.x * Globals.scaling, this.destinazione.y * Globals.scaling);
        // Dopo si disegna effettivamente
        context.stroke();
    }


}
