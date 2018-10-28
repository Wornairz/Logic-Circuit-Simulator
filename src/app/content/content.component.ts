import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';


// Forse dovremmo stabilire anche una convenzione per i nomi delle variabili
// tipo tutto inglese/tutto italiano. Scrivere filo invece di wire mi sembrava brutto, lol
// I nomi di alcuni metodi sono discutibili, se ne hai di migliori cambiali pure



// Credo che questa class converrebbe metterla in un file a parte (?)
class Wire {
  public sorgente: { x: number, y: number };
  public destinazione: { x: number, y: number };
  constructor(sorgente, destinazione) {
    this.sorgente = sorgente;
    this.destinazione = destinazione;
  }
  public passaDa(x: number, y: number): boolean {
    if(x == this.sorgente.x || x == this.destinazione.x){
      if((y >= this.sorgente.y && y <= this.destinazione.y) || (y >= this.destinazione.y && y <= this.sorgente.y))
        return true;
    }
    else if(y == this.sorgente.y || y == this.destinazione.y){
      if((x >= this.sorgente.x && x <= this.destinazione.x) || (x >= this.destinazione.x && x <= this.sorgente.x))
        return true;
    }
    else return false;
  }
}

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
    this.spazio_linee = 50;
    this.prevPos = null;
    this.currentPos = null;
    this.wires = Array();

    // Si imposta la larghezza e l'altezza del canvas
    canvasElement.width = this.width;
    canvasElement.height = this.height;

    // Si impostano alcuni parametri della linea
    this.context.lineWidth = 3; // spessore
    this.context.lineCap = 'round'; // forma agli estremi della linea
    this.context.strokeStyle = '#000000'; // colore

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
      let attPos = this.getFixedPos(e.clientX, e.clientY);
      console.log(attPos);
      if(this.cancella){
        let daCancellare : number = -1;
        this.wires.forEach(wire => {
          if(wire.passaDa(attPos.x, attPos.y)){
            daCancellare = this.wires.indexOf(wire);
          }
        });
        if(daCancellare!=-1)
          this.wires.splice(daCancellare, 1);
        this.reDraw();
      }
      else this.set(e);
    }, false);

    // Se il tasto viene rilasciato, si chiama il metodo reset e si salvano le informazioni relative al filo
    canvasElement.addEventListener('mouseup', (e) => {
      if (this.movimento) {
        this.addWire();
      }
      this.reset();
      this.wires.forEach(wire => {
        console.log("sx = " + wire.sorgente.x + " sy = " + wire.sorgente.y + " dx = " + wire.destinazione.x + " dy = " + wire.destinazione.y);
      });
    }, false);

    // Se il cursore del mouse esce dall'area del canvas il filo viene eliminato e viene richiamato il metodo reset
    canvasElement.addEventListener('mouseleave', (e) => {
      this.reDraw();
      this.reset();
    }, false);

  }

  private getFixedPos(x: number, y: number) {
    let realX = x - this.rect.left;
    let realY = y - this.rect.top;
    let distGridX = realX % this.spazio_linee;
    let distGridY = realY % this.spazio_linee;
    let fixedPos: any;
    fixedPos = {
      x: realX - distGridX + (distGridX > this.spazio_linee / 2 ? this.spazio_linee : 0),
      y: realY - distGridY + (distGridY > this.spazio_linee / 2 ? this.spazio_linee : 0)
    };
    return fixedPos;
  }

  private gestisciDisegno(e: MouseEvent) {
    // Si salvano le posizioni relative al canvas del mouse nella variabile currentPos
    let realX = e.clientX - this.rect.left;
    let realY = e.clientY - this.rect.top;
    let distGridX = realX % this.spazio_linee;
    let distGridY = realY % this.spazio_linee;
    this.currentPos = {
      x: realX - distGridX + (distGridX > this.spazio_linee / 2 ? this.spazio_linee : 0),
      y: realY - distGridY + (distGridY > this.spazio_linee / 2 ? this.spazio_linee : 0)
    };
    // Vengono ridisegnati i componenti precedenti
    this.reDraw();
    // Viene disegnato il nuovo filo
    this.disegnaLinea(this.prevPos, this.currentPos);
  }


  private disegnaLinea(sorgente: { x: number, y: number }, destinazione: { x: number, y: number }) {
    // Inizia un nuovo percorso
    this.context.beginPath();

    // Si inizia a disegnare dalle coordinate di sorgente...
    this.context.moveTo(sorgente.x, sorgente.y);

    // ... fino alle coordinate della x di destinazione (linea orizzontale)
    this.context.lineTo(destinazione.x, sorgente.y);

    // Poi si traccia un'altra linea verticale
    this.context.lineTo(destinazione.x, destinazione.y);

    // Dopo si disegna effettivamente
    this.context.stroke();
  }

  private reDraw() {
    // Si pulisce il canvas
    this.context.clearRect(0, 0, this.width, this.height);
    // Viene disegnata la griglia
    this.drawGrid();
    // METODO PROVVISORIO
    this.disegnaImmagine();
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
    let realX = e.clientX - this.rect.left;
    let realY = e.clientY - this.rect.top;
    let distGridX = realX % this.spazio_linee;
    let distGridY = realY % this.spazio_linee;
    this.prevPos = {
      x: realX - distGridX + (distGridX > this.spazio_linee / 2 ? this.spazio_linee : 0),
      y: realY - distGridY + (distGridY > this.spazio_linee / 2 ? this.spazio_linee : 0)
    };
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

  private drawGrid() {
    // Si imposta un tratto più leggero per tracciare la griglia
    const lastratto = this.context.lineWidth;
    this.context.lineWidth = 0.03;
    this.context.beginPath();

    for (let i = 0; i < this.height; i += this.spazio_linee) {
      this.context.moveTo(1, i);
      this.context.lineTo(this.width, i);
      this.context.stroke();
    }

    for (let i = 0; i < this.width; i += this.spazio_linee) {
      this.context.moveTo(i, 1);
      this.context.lineTo(i, this.height);
      this.context.stroke();
    }
    // Si reimposta il tratto precedente
    this.context.lineWidth = lastratto;
  }


  // metodo provvisorio, serve solo per mostrare porte a caso al momento
  private disegnaImmagine() {
    /*this.context.beginPath();
    this.context.moveTo(0, 0);

    let AND = new Image();
    AND.src = "/assets/AND.svg";
    this.context.drawImage(AND, 0, 0);

    let OR = new Image();
    OR.src = "/assets/OR.svg";
    this.context.drawImage(OR, 0, 300);
    this.context.stroke();*/
  }

  public cancmode() {
    this.disegna = false;
    this.cancella = true;
  }
  
  public dismode(){
    this.disegna = true;
    this.cancella = false;
  }

}
