import { Globals, position } from '../globals';
import { Pin } from './pin';

export class Componente {
    public posizione: position;
    public width: number;
    public height: number;
    private alive: boolean = true;
    public immagine: HTMLImageElement;
    public type: string;
    private numero_input: number;
    public truth_table: number[][];
    public inputs: Array<Pin>;

    constructor(numero_input: number, type: string, posizione: position) {
        this.immagine = new Image();
        this.immagine.src = '/assets/' + type + '.svg';
        this.numero_input = numero_input;
        this.height = (Math.floor(numero_input / 2) + 1) * 2;
        this.width = this.normalizzaLarghezza();
        this.posizione = posizione;
        this.type = type;
        this.inputs = Array();
        this.truthTable();
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

    public changeState(stato: number) {
        if (this.type == "INPUT" || this.type == "INPUTN") {
            this.type = "INPUT" + (stato == 1 ? "" : "N");
            this.immagine.src = '/assets/' + this.type + '.svg';
        }
        else if (this.type == "WLED" || this.type == "RLED" || this.type == "GLED") {
            this.type = (stato == 1 ? "G" : "R") + "LED";
            this.immagine.src = '/assets/' + this.type + '.svg';
        }
    }

    public truthTable() {
        switch (this.type) {
            case "AND": this.truth_table = [[0, 0], [0, 1]];
                break;
            case "NAND": this.truth_table = [[1, 1], [1, 0]];
                break;
            case "OR": this.truth_table = [[0, 1], [1, 1]];
                break;
            case "NOR": this.truth_table = [[1, 0], [0, 0]];
                break;
            case "XOR": this.truth_table = [[0, 1], [1, 0]];
                break;
            default: this.truthTable = null;
        }
    }

    public evaluate() {
        let output = -1;
        if (this.isReady()) {
            if (this.truth_table != null) {
                output = this.truth_table[this.inputs[0].value][this.inputs[1].value];
                for (let i = 2; i < this.inputs.length; i++) {
                    output = this.truth_table[output][this.inputs[i].value];
                }
            }
            else if(this.type == "NOT") output = (this.inputs[0].value != -1 ? 1 - this.inputs[0].value : -1);
            else output = this.inputs[0].value;

        }
        return output;
    }

    public isReady() {
        return (this.numero_input === this.inputs.length);
    }

    public kill() {
        this.alive = false;
    }

    public isAlive() {
        return this.alive;
    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.drawImage(this.immagine, this.posizione.x * Globals.scaling, this.posizione.y * Globals.scaling, this.width * Globals.scaling, this.height * Globals.scaling);
        context.stroke();
    }



}
