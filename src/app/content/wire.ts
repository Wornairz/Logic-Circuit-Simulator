import { Pin } from './pin';
import { position } from '../globals';

export class Wire {
    public sorgente: Pin;
    public destinazione: Pin;
    public static spessore = 2.5;
    public static colore = '#000000';
    public spostamento_orizzontale: boolean;


    constructor(sorgente: position, destinazione: position , spostamento_orizzontale: boolean) {
        this.sorgente = new Pin(sorgente);
        this.destinazione = new Pin(destinazione);
        this.spostamento_orizzontale = spostamento_orizzontale;
    }

    public collide(x: number, y: number): boolean {
        let a = this.sorgente.posizione.x;
        let b = this.destinazione.posizione.y;
        if (this.spostamento_orizzontale) {
            a = this.destinazione.posizione.x;
            b = this.sorgente.posizione.y;
        }
        if (x >= a - 2.5 * Wire.spessore && x <= a + 2.5 * Wire.spessore) {
            if ((y >= this.sorgente.posizione.y && y <= this.destinazione.posizione.y) || (y >= this.destinazione.posizione.y && y <= this.sorgente.posizione.y)) {
                return true;
            }
        } else if (y >= b - 2.5 * Wire.spessore && y <= b + 2.5 * Wire.spessore) {
            if ((x >= this.sorgente.posizione.x && x <= this.destinazione.posizione.x) || (x >= this.destinazione.posizione.x && x <= this.sorgente.posizione.x)) {
                return true;
            }
        } else { return false; }
    }

    public draw(context: CanvasRenderingContext2D) {
        // Inizia un nuovo percorso
        context.beginPath();

        context.lineWidth = Wire.spessore;
        context.strokeStyle = Wire.colore;
        // Si inizia a disegnare dalle coordinate di sorgente...
        context.moveTo(this.sorgente.posizione.x, this.sorgente.posizione.y);
        // ... fino alle coordinate della x di destinazione (linea orizzontale)

        // Se lo spostamento tende verso destra, allora si disegna prima una linea orizzontale
        if (this.spostamento_orizzontale) {
            context.lineTo(this.destinazione.posizione.x, this.sorgente.posizione.y);
        } else {
            context.lineTo(this.sorgente.posizione.x, this.destinazione.posizione.y);
        }

        context.lineTo(this.destinazione.posizione.x, this.destinazione.posizione.y);
        // Dopo si disegna effettivamente
        context.stroke();

        // Si disegnano i due quadrati alle estremità del percorso
        context.beginPath();
        this.sorgente.draw(context);
        this.destinazione.draw(context);
        context.stroke();
    }
}
