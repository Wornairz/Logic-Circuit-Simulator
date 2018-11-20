export class Wire {
    public sorgente: { x: number, y: number };
    public destinazione: { x: number, y: number };
    public static spessore = 2.5;
    public static colore = '#000000';
    public spostamento_orizzontale: boolean;
    constructor(sorgente, destinazione, spostamento_orizzontale) {
        this.sorgente = sorgente;
        this.destinazione = destinazione;
        this.spostamento_orizzontale = spostamento_orizzontale;
    }
    public collide(x: number, y: number): boolean {
        let a = this.sorgente.x;
        let b = this.destinazione.y;
        if (this.spostamento_orizzontale) {
            a = this.destinazione.x;
            b = this.sorgente.y;
        }
        if (x >= a - 2.5 * Wire.spessore && x <= a + 2.5 * Wire.spessore) {
            if ((y >= this.sorgente.y && y <= this.destinazione.y) || (y >= this.destinazione.y && y <= this.sorgente.y)) {
                return true;
            }
        } else if (y >= b - 2.5 * Wire.spessore && y <= b + 2.5 * Wire.spessore) {
            if ((x >= this.sorgente.x && x <= this.destinazione.x) || (x >= this.destinazione.x && x <= this.sorgente.x)) {
                return true;
            }
        } else { return false; }
    }
}
