import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Wire } from "./wire";

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})


export class ContentComponent implements AfterViewInit {
  // Riferimento al canvas
  @ViewChild('foglio') foglio: ElementRef;

  private context: CanvasRenderingContext2D;
  private currentPos: { x: number, y: number };
  private prevPos: { x: number, y: number };
  private rect: ClientRect;
  private disegna: boolean;
  private wires: Array<Wire>;
  private movimento: boolean;
  private spazio_linee: number;
  private cancella: boolean;

  @Input() public width = 1520;
  @Input() public height = 750;


  ngAfterViewInit() {
    const canvasElement: HTMLCanvasElement = this.foglio.nativeElement;

    // Si inizializzano gli attributi
    this.context = canvasElement.getContext('2d');
    this.rect = canvasElement.getBoundingClientRect();
    this.disegna = false;
    this.movimento = false;
    this.cancella = false;
    this.spazio_linee = 30;
    this.prevPos = null;
    this.currentPos = null;
    this.wires = Array();

    // Si imposta la larghezza e l'altezza del canvas
    canvasElement.width = this.width;
    canvasElement.height = this.height;

    // Si impostano alcuni parametri della linea
    this.context.lineWidth = Wire.spessore; // spessore
    this.context.lineCap = 'round'; // forma agli estremi della linea
    this.context.strokeStyle = '#000000'; // colore
    this.context.fillStyle = '#FFFFFF'; // colore riempimento 

    // Si disegna la griglia
    this.drawGrid();
    // Si richiama il metodo in cui verrano gestiti gli eventi
    this.gestisciEventi(canvasElement);
  }

  private gestisciEventi(canvasElement: HTMLCanvasElement) {
    // Se il valore di disegna è true, allora è possibile disegnare
    canvasElement.addEventListener('mousemove', (e) => {
      if (this.disegna) {
        this.gestisciDisegno(e);
        this.movimento = true;
      }
    }, false);

    // Se il tasto sinistro del mouse viene premuto, si richiama il metodo set
    canvasElement.addEventListener('mousedown', (e) => {
      if (this.cancella) {
        this.removeWire(e);
        this.reDraw();
      }
      else this.set(e);
    }, false);

    // Se il tasto viene rilasciato, si chiama il metodo reset e si salvano le informazioni relative al filo
    canvasElement.addEventListener('mouseup', (e) => {
      if (this.movimento) {
        if (this.prevPos.x == this.currentPos.x && this.prevPos.y == this.currentPos.y) {
          this.reDraw();
        }
        else this.addWire();
      }
      this.reset();
    }, false);

    // Se il cursore del mouse esce dall'area del canvas il filo viene eliminato e viene richiamato il metodo reset
    canvasElement.addEventListener('mouseleave', (e) => {
      this.reDraw();
      this.reset();
    }, false);

  }

  private gestisciDisegno(e: MouseEvent) {
    // Si salvano le posizioni relative al canvas del mouse nella variabile currentPos
    this.currentPos = this.getFixedPos(e.clientX, e.clientY);
    // Vengono ridisegnati i componenti precedenti
    this.reDraw();
    // Viene disegnato il nuovo filo
    this.disegnaLinea(this.prevPos, this.currentPos);
  }


  private disegnaLinea(sorgente: { x: number, y: number }, destinazione: { x: number, y: number }) {
    // Inizia un nuovo percorso
    this.context.beginPath();
    this.context.lineWidth = Wire.spessore;

    // Si inizia a disegnare dalle coordinate di sorgente...
    this.context.moveTo(sorgente.x, sorgente.y);

    // ... fino alle coordinate della x di destinazione (linea orizzontale)
    this.context.lineTo(destinazione.x, sorgente.y);

    // Poi si traccia un'altra linea verticale
    this.context.lineTo(destinazione.x, destinazione.y);

    // Dopo si disegna effettivamente
    this.context.stroke();

    // Si disegnano i due quadrati alle estremità del percorso
    this.context.beginPath();
    this.context.lineWidth = 2.3;
    this.context.rect(sorgente.x - 4, sorgente.y - 4, 8, 8);
    this.context.fill();
    this.context.rect(destinazione.x - 4, destinazione.y - 4, 8, 8);
    this.context.fill();
    this.context.stroke();
  }

  private reDraw() {
    // Si pulisce il canvas
    this.context.clearRect(0, 0, this.width, this.height);
    // Viene disegnata la griglia
    this.drawGrid();
    //this.drawComponent();
    // Vengono ridisegnati i fili precedenti
    this.drawWires();
  }

  private reset() {
    // Viene impedita la possibilità di disegnare impostando il valore di disegna a false
    this.disegna = false;
    // Si imposta a true il boolean che indica se c'è stato un movimento dopo il click del mouse
    // serve per evitare di tracciare punti ed altri errori
    this.movimento = false;
    // Viene resettato anche il valore della posizione precedente
    this.prevPos = null;

  }

  private set(e: MouseEvent) {
    // Vengono salvate le coordinate del mouse al momento della pressione del tasto
    this.prevPos = this.getFixedPos(e.clientX, e.clientY);
    // Si permette il disegno impostando il valore di disegna a true
    this.disegna = true;
  }

  private drawWires() {
    // Si disegnano tutti i fili
    this.wires.forEach((wire) => {
      this.disegnaLinea(wire.sorgente, wire.destinazione);
    });
  }

  private addWire() {
    // Si salvano le informazioni relative al filo nell'array
    this.wires.push(new Wire(this.prevPos, this.currentPos));
  }

  private removeWire(e: MouseEvent) {
    // Si elimina il filo selezionato, se esiste, che è stato disegnato per ultimo 
    let daCancellare: number = -1;
    this.wires.forEach(wire => {
      if (wire.passaDa(e.clientX - this.rect.left, e.clientY - this.rect.top)) {
        daCancellare = this.wires.indexOf(wire);
      }
    });
    if (daCancellare != -1)
      this.wires.splice(daCancellare, 1);
  }

  private getFixedPos(x: number, y: number) {
    // Posizioni relative al canvas
    let realX = x - this.rect.left;
    let realY = y - this.rect.top;

    // Spazio in mezzo alle linee
    let distGridX = realX % this.spazio_linee;
    let distGridY = realY % this.spazio_linee;
    let fixedPos: any;

    // Posizione arrotondata alla linee più vicine
    fixedPos = {
      x: realX - distGridX + (distGridX > this.spazio_linee / 2 ? this.spazio_linee : 0),
      y: realY - distGridY + (distGridY > this.spazio_linee / 2 ? this.spazio_linee : 0)
    };
    return fixedPos;
  }

  private drawGrid() {
    // Si imposta un tratto più leggero per tracciare la griglia
    this.context.lineWidth = 0.3;
    this.context.beginPath();

    for (let i = 0.5; i < this.height; i += this.spazio_linee) {
      this.context.moveTo(0, i);
      this.context.lineTo(this.width, i);
    }
    for (let i = 0.5; i < this.width; i += this.spazio_linee) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, this.height);
    }
    // Si disegna effettivamente
    this.context.stroke();
  }

  /*private drawComponent() {
    // PRIMO TENTATIVO PER DISEGNARE I COMPONENTI
    let immagine = new Image();
    immagine.src = 'assets/AND2.svg';

    let altezza = this.spazio_linee * 5;
    this.context.drawImage(immagine, 30, 48, altezza, immagine.height / immagine.width * altezza);
  }*/

  public cancmode() {
    this.disegna = false;
    this.cancella = true;
  }

  public dismode() {
    this.cancella = false;
  }

}
