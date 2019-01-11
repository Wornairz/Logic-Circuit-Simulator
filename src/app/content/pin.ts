import { Globals, position, color } from '../globals';
import { Wire } from './wire';
import { Componente } from './componente';


export class Pin {
    private _posizione: position;
    public next: Array<Pin>;
    private relativePosition: position = null;
    public parent: Array<any> = null;
    public colore: string = '#0066ffa0';
    private _value: number = -1;
    public colore_DFS: color = color.White;
    public static size: number = 0.4;
    public static spessore: number = 0.1;


    constructor(posizione: position, parent: Wire | Componente) {
        this.relativePosition = posizione;
        this.parent = new Array();
        this.parent.push(parent);
        this.next = new Array();
        this._posizione = {
            x: this.parent[0].posizione.x + this.relativePosition.x,
            y: this.parent[0].posizione.y + this.relativePosition.y
        };
    }

    get posizione(): position {
        this._posizione.x = this.parent[0].posizione.x + this.relativePosition.x;
        this._posizione.y = this.parent[0].posizione.y + this.relativePosition.y;
        return this._posizione;
    }
    set value(value: number) {
        this._value = value;
    }
    get value(): number {
        return this._value;
    }

    public equals(punto: Pin) {
        return (this.posizione.x === punto.posizione.x && this.posizione.y === punto.posizione.y);
    }

    public changeNext(pin: Pin) {
        for (let i = this.next.length - 1; i >= 0; i--) {
            if (this.next[i].equals(pin)) {
                this.next.splice(i, 1);
                this.addNext(pin);
            }
        }
    }

    public updateNext() {
        for (let i = this.next.length - 1; i >= 0; i--) {
            if (this.next[i].parent.length === 0 || !this.isConnectedTo(this.next[i]))
                this.next.splice(i, 1);
        }
    }

    public updateParents() {
        for (let i = this.parent.length - 1; i >= 0; i--)
            if (!this.parent[i].isAlive())
                this.parent.splice(i, 1);
        this.updateColor();
        this.updatePosition();
        return this.parent.length >= 1;
    }

    public updatePosition() {
        if (this.parent[0] instanceof Wire) {
            this.relativePosition = this._posizione;
        }
    }

    public updateColor() {
        if (this.parent.length > 1)
            this.colore = "#24e5c1e0";
        else this.colore = "#0066ffa0";
    }

    public resetValue() {
        if (this.parent[0] instanceof Componente) {
            if (this.parent[0].type === "INPUT")
                this._value = 1;
            else if (this.parent[0].type === "INPUTN")
                this._value = 0;
            else this._value = -1;
        }
        else this._value = -1;
    }

    public isConnectedTo(pin: Pin) {
        //Se i due pin hanno almeno un parent in comune(e non sono entrambi input di un componente), ciò implica che sono connessi
        // flag = numero genitori in comune
        let flag = 0;
        this.parent.forEach((myParent) => {
            pin.parent.forEach((yourParent) => {
                if ((myParent instanceof Wire || this.posizione.x !== pin.posizione.x) && myParent === yourParent)
                    flag++;
            })
        })
        return flag;

    }

    public addNext(last: Pin) {
        this.addElement(last, this.next);
    }

    public addParent(last: Wire) {
        if (last.sorgente.x === this.posizione.x && last.sorgente.y === this.posizione.y)
            last.sorgente = this.posizione;
        else last.destinazione = this.posizione;
        this.addElement(last, this.parent);
    }

    public addElement(last: any, elementi: Array<any>) {
        let i: number;
        for (i = elementi.length - 1; i >= 0 && !last.equals(elementi[i]); i--);
        if (i === -1)
            elementi.push(last);
    }

    public updateParentProperties() {
        this.parent.forEach((parent) => {
            if (parent instanceof Wire) {
                switch (this.value) {
                    case -1: parent.undefinedState();
                        break;
                    case 0: parent.falseState();
                        break;
                    case 1: parent.trueState();
                        break;
                    default: break;
                }
            }

        });

    }

    public draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.strokeStyle = this.colore;
        context.lineWidth = Pin.spessore;
        context.fillStyle = this.colore;
        context.rect((this.posizione.x - Pin.size / 2) * Globals.scaling, (this.posizione.y - Pin.size / 2) * Globals.scaling, Pin.size * Globals.scaling, Pin.size * Globals.scaling);
        context.fill();
    }

    public getComponent() {
        return this.parent[0];
    }



    public printTemp() {
        console.log("I'm at: ");
        console.log(this.posizione);
        console.log("My next are: ");
        for (let i = this.next.length - 1; i >= 0; i--) {
            console.log(this.next[i].posizione);
        }
        console.log("My parents are: ");
        for (let i = this.parent.length - 1; i >= 0; i--) {
            console.log(this.parent[i]);
        }

    }



}


