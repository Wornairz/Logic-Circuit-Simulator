import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Componente } from "./componente";
import { Wire } from "./wire";
import { Globals } from '../globals';



@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})


export class ContentComponent implements AfterViewInit {
  // Riferimento al canvas
  @ViewChild('foglio') foglio: ElementRef;

  private currentPos: { x: number, y: number };
  private prevPos: { x: number, y: number };
  private context: CanvasRenderingContext2D;
  private componenti: Array<Componente>;
  private wires: Array<Wire>;
  private movimento: boolean;
  private rect: ClientRect;
  private disegna: boolean;
  private modalita: number;
  private boxSize: number;
  private dx: number;
  private dy: number;
  public width = 1520;
  public height = 750;


  ngAfterViewInit() {
    const canvasElement: HTMLCanvasElement = this.foglio.nativeElement;

    // Si inizializzano gli attributi
    this.context = canvasElement.getContext('2d');
    this.rect = canvasElement.getBoundingClientRect();
    this.disegna = false;
    this.movimento = false;
    this.modalita = 0;
    this.boxSize = Globals.spazio_linee / 4;
    this.prevPos = null;
    this.currentPos = null;
    this.wires = Array();
    this.componenti = Array();
    this.dx = 0;
    this.dy = 0;

    // Si imposta la larghezza e l'altezza del canvas
    canvasElement.width = this.width;
    canvasElement.height = this.height;

    // Si impostano alcuni parametri della linea
    this.context.lineWidth = Wire.spessore; // spessore
    this.context.lineCap = 'round'; // forma agli estremi della linea

    this.metodoDiProva();
    // Si disegna la griglia
    this.drawGrid();
    // Si disegnano i componenti, per ora lo richiamo qui per provare
    this.drawComponents();
    // Si richiama il metodo in cui verrano gestiti gli eventi
    this.gestisciEventi(canvasElement);
  }

  private metodoDiProva() {
    // Queste cose verranno poi fatte in base al componente scelto nella toolbar

    // Si impostano le posizioni relative alla griglia del componente. Es: [0, 2] vuol dire prima riga-terza colonna nella griglia del componente
    let i1 = [0, 1]; let i2 = [0, 3];
    this.addComponent(4, [i1, i2], { x: 120, y: 60 }, 'assets/NAND.svg');
    this.addComponent(4, [i1, i2], { x: 120, y: 300 }, 'assets/INPUT.svg');
    // Per le porte *OR la riga è spostata, per via della loro forma
    let i3 = [0.5, 1]; let i4 = [0.5, 3];
    this.addComponent(4, [i3, i4], { x: 120, y: 180 }, 'assets/NOR.svg');
    this.addComponent(4, [i3, i4], { x: 260, y: 180 }, 'assets/XOR.svg');
    this.addComponent(4, [i1, i2], { x: 420, y: 180 }, 'assets/NOT.svg');
  }

  private enableMovement(e: MouseEvent) {
    /*let realX = e.clientX - this.rect.left;
    let realY = e.clientY - this.rect.top;
    this.componenti.forEach((componente) => {
      if (componente.collide(realX, realY)) {
        this.prevPos = {x: realX, y: realY};
        this.movimento = true;
      }
    });*/
  }

  private gestisciEventi(canvasElement: HTMLCanvasElement) {
    // Se il valore di disegna è true, allora è possibile disegnare
    canvasElement.addEventListener('mousemove', (e) => {
      if (this.disegna) {
        this.gestisciDisegno(e);
        this.movimento = true;
      }
    });

    // Se il tasto sinistro del mouse viene premuto, si richiama il metodo set
    canvasElement.addEventListener('mousedown', (e) => {
      // 0: disegno, 1: cancellazione, 2: movimento
      switch (this.modalita) {
        case 0: this.enableDrawing(e);
          break;
        case 1: this.removeWire(e);
          this.reDraw();
          break;
        case 2: this.enableMovement(e);
          break;
      }
    });

    // Se il tasto viene rilasciato, si chiama il metodo reset e si salvano le informazioni relative al filo
    canvasElement.addEventListener('mouseup', (e) => {
      if (this.movimento) {
        if (this.prevPos.x == this.currentPos.x && this.prevPos.y == this.currentPos.y) {
          this.reDraw();
        }
        else this.addWire();
      }
      this.disableDrawing();
    });

    // Se il cursore del mouse esce dall'area del canvas il filo viene eliminato e viene richiamato il metodo reset
    canvasElement.addEventListener('mouseleave', (e) => {
      this.reDraw();
      this.disableDrawing();
    });
    // Il terzo parametro, useCapture, è false di default
  }

  private gestisciDisegno(e: MouseEvent) {
    // Si salvano le posizioni relative al canvas nella variabile currentPos
    this.currentPos = this.getFixedPos(e.clientX, e.clientY);
    // Vengono ridisegnati i componenti precedenti
    this.reDraw();
    // Calcola lo spostamento avvenuto
    this.calcola_spostamento();
    // Viene disegnato il nuovo filo
    this.disegnaLinea(this.prevPos, this.currentPos, this.dx > this.dy);
  }

  private disegnaLinea(sorgente: { x: number, y: number }, destinazione: { x: number, y: number }, spostamento_orizzontale) {
    // Inizia un nuovo percorso
    this.context.beginPath();

    this.context.lineWidth = Wire.spessore;
    this.context.strokeStyle = Wire.colore;
    // Si inizia a disegnare dalle coordinate di sorgente...
    this.context.moveTo(sorgente.x, sorgente.y);
    // ... fino alle coordinate della x di destinazione (linea orizzontale)

    // Se lo spostamento tende verso destra, allora si disegna prima una linea orizzontale
    if (spostamento_orizzontale) this.context.lineTo(destinazione.x, sorgente.y);
    else this.context.lineTo(sorgente.x, destinazione.y);

    this.context.lineTo(destinazione.x, destinazione.y);
    // Dopo si disegna effettivamente
    this.context.stroke();

    // Si disegnano i due quadrati alle estremità del percorso
    this.context.beginPath();
    this.drawBox(sorgente, this.boxSize);
    this.drawBox(destinazione, this.boxSize);
    this.context.stroke();
  }

  private reDraw() {
    // Si pulisce il canvas
    this.context.clearRect(0, 0, this.width, this.height);
    // Viene ridisegnata la griglia
    this.drawGrid();
    // Vengono ridisegnati tutti i componenti
    this.drawComponents();
    // Vengono ridisegnati tutti i fili
    this.drawWires();
  }

  private disableDrawing() {
    // Viene impedita la possibilità di disegnare impostando il valore di disegna a false
    this.disegna = false;
    // Si imposta a false il boolean che indica se c'è stato un movimento dopo il click del mouse
    this.movimento = false;
    // Viene resettato anche il valore della posizione precedente
    this.prevPos = null;
    // Si resetta il valore degli spostamenti
    this.dx = this.dy = 0;
  }

  private enableDrawing(e: MouseEvent) {
    // Vengono salvate le coordinate del mouse al momento della pressione del tasto
    this.prevPos = this.getFixedPos(e.clientX, e.clientY);
    // Si permette il disegno impostando il valore di disegna a true
    this.disegna = true;
  }

  private drawWires() {
    // Si disegnano tutti i fili
    this.context.lineWidth = Wire.spessore;
    this.wires.forEach((wire) => {
      this.disegnaLinea(wire.sorgente, wire.destinazione, wire.spostamento_orizzontale);
    });
  }

  private addWire() {
    // Si salvano le informazioni relative al filo nell'array
    this.wires.push(new Wire(this.prevPos, this.currentPos, this.dx > this.dy));
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
    let distGridX = realX % Globals.spazio_linee;
    let distGridY = realY % Globals.spazio_linee;
    let fixedPos: any;

    // Posizione arrotondata alla linee più vicine
    fixedPos = {
      x: realX - distGridX + (distGridX > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0),
      y: realY - distGridY + (distGridY > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0)
    };
    return fixedPos;
  }

  private drawGrid() {
    // Si imposta un tratto più leggero per tracciare la griglia
    this.context.lineWidth = 0.2;
    this.context.strokeStyle = Wire.colore;
    this.context.beginPath();

    for (let i = 0.5; i < this.height; i += Globals.spazio_linee) {
      this.context.moveTo(0, i);
      this.context.lineTo(this.width, i);
    }
    for (let i = 0.5; i < this.width; i += Globals.spazio_linee) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, this.height);
    }
    // Si disegna effettivamente
    this.context.stroke();
  }

  private drawBox(posizione: { x: number, y: number }, lato: number) {
    let colore = '#0066ffa0';
    this.context.strokeStyle = colore;
    this.context.fillStyle = colore;
    this.context.lineWidth = 3;
    this.context.rect(posizione.x - lato / 2, posizione.y - lato / 2, lato, lato);
    this.context.fill();
  }

  private drawComponents() {
    // Si disegna ogni componente ed anche i rispettivi input ed output graficamente
    this.componenti.forEach((componente) => {
      this.context.beginPath();
      this.context.drawImage(componente.immagine, componente.posizione.x, componente.posizione.y, componente.width, componente.height);

      // Si scorre l'array degli input, per alcuni componenti possono essercene più di 2/3
      componente.input.forEach((input) => {
        this.drawBox(input, this.boxSize);
      });

      this.drawBox(componente.output, this.boxSize);
      this.context.stroke();
    });
  }

  private calcola_spostamento() {
    if (this.dx == 0 && this.dy == 0) {
      this.dx = Math.abs(this.prevPos.x - this.currentPos.x);
      this.dy = Math.abs(this.prevPos.y - this.currentPos.y);
    }
  }

  private addComponent(numero_quadrati, input, posizione_iniziale, percorso) {
    let c = new Componente(numero_quadrati, percorso, posizione_iniziale);
    input.forEach((input) => {
      c.setInput(input[0], input[1]);
    });
    this.componenti.push(c);
  }

  public changeMode(value) {
    // 0: disegno, 1: cancellazione, 2: movimento
    this.modalita = value;
    this.disableDrawing();
  }

}
