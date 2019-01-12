/*** Valori usati globalmente nell'applicazione ***/

export class Globals {
    public static width: number = window.innerWidth + ((window.innerWidth >= 960) ? -225 : -25); //width "reale" del canvas
    public static height: number = window.innerHeight - 150; //height "reale" del canvas
    public static scaling: number = 20; //fattore di scala che si modifica con la rotellina (guardare l'event listener 'wheel' in content.component.ts)
}

export type position = { x: number, y: number }; // struttura dati per esprimere la posizione degli elementi nel canvas

export enum color { //colori della DFS
    White = 0,
    Gray = 1,
    Black = 2
}