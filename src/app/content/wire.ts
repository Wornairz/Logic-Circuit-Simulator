export class Wire {
    public sorgente: { x: number, y: number };
    public destinazione: { x: number, y: number };
    public static spessore: number = 2.5;
    constructor(sorgente, destinazione) {
        this.sorgente = sorgente;
        this.destinazione = destinazione;
    }
    public passaDa(x: number, y: number): boolean {
        if (x >= this.destinazione.x - 2 * Wire.spessore && x <= this.destinazione.x + 2 * Wire.spessore) {
            if ((y >= this.sorgente.y && y <= this.destinazione.y) || (y >= this.destinazione.y && y <= this.sorgente.y))
                return true;
        }
        else if (y >= this.sorgente.y - 2 * Wire.spessore && y <= this.sorgente.y + 2 * Wire.spessore) {
            if ((x >= this.sorgente.x && x <= this.destinazione.x) || (x >= this.destinazione.x && x <= this.sorgente.x))
                return true;
        }
        else return false;
    }
}