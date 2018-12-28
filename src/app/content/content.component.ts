import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Componente } from './componente';
import { Wire } from './wire';
import { Globals, position } from '../globals';



@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})


export class ContentComponent implements AfterViewInit {
  // Riferimento al canvas
  @ViewChild('foglio') foglio: ElementRef;

  private currentPos: position;
  private prevPos: position;
  private context: CanvasRenderingContext2D;
  private componenti: Array<Componente>;
  private selezionato: any;
  private wires: Array<Wire>;
  private rect: ClientRect;
  private modalita: number;
  private stato: number;
  private dx: number;
  private dy: number;



  ngAfterViewInit() {
    const canvasElement: HTMLCanvasElement = this.foglio.nativeElement;

    // Si inizializzano gli attributi
    this.context = canvasElement.getContext('2d');
    this.rect = canvasElement.getBoundingClientRect();
    this.modalita = 0;
    this.stato = -1;
    this.prevPos = this.currentPos = null;
    this.wires = Array();
    this.componenti = Array();
    this.selezionato = null;
    this.dx = this.dy = 0;


    // Si imposta la larghezza e l'altezza del canvas
    canvasElement.width = Globals.width;
    canvasElement.height = Globals.height;

    // Si impostano alcuni parametri della linea
    this.context.lineWidth = Wire.spessore; // spessore
    this.context.lineCap = 'round'; // forma agli estremi della linea

    // Si disegna la griglia
    this.drawGrid();
    // Si richiama il metodo in cui verrano gestiti gli eventi
    this.gestisciEventi(canvasElement);
  }

  private gestisciEventi(canvasElement: HTMLCanvasElement) {

    canvasElement.addEventListener('mousedown', (e) => {
      e.preventDefault();
      // 0: abilitazione_disegno, 1: cancellazione, 2: abilitazione_movimento
      if (e.which === 1)
        switch (this.modalita) {
          case 0: this.enableDrawing(e);
            break;
          case 1: this.removeElement(e);
            this.reDraw();
            break;
          case 2: this.enableMovement(e);
            break;
        }
    });

    canvasElement.addEventListener('mousemove', (e) => {
      e.preventDefault();
      // 0: disegno_in_corso, 1: spostamento_in_corso, 2: inserimento_in_corso
      switch (this.stato) {
        case 0: this.gestisciDisegno(e);
          break;
        case 1: this.spostaElemento(e);
          this.reDraw();
          break;
        case 2: this.spostaElemento(e);
          this.reDraw();
          this.selezionato.draw(this.context);
      }
    });

    canvasElement.addEventListener('mouseup', (e) => {
      e.preventDefault();
      if (e.which === 1) {
        if (!(this.prevPos == null || this.currentPos === null || (this.prevPos.x === this.currentPos.x && this.prevPos.y === this.currentPos.y))) {
          this.wires.push(this.selezionato);
        }
        else if (this.stato == 2) {
          this.componenti.push(this.selezionato);
        }
      }
      this.reDraw();
      this.reset();
    });

    canvasElement.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      this.reDraw();
      this.reset();
    });

  }

  private gestisciDisegno(e: MouseEvent) {
    // Si salvano le posizioni relative al canvas nella variabile currentPos
    this.currentPos = this.getFixedPos(e.clientX, e.clientY);
    // Vengono ridisegnati i componenti precedenti
    this.reDraw();
    // Calcola lo spostamento avvenuto
    this.calcola_spostamento();
    // Viene disegnato il nuovo filo
    this.selezionato.destinazione.posizione = this.currentPos;
    this.selezionato.draw(this.context);
  }

  private reset() {
    // Viene impedita la possibilità di disegnare impostando il valore di disegna a false
    this.stato = -1;
    this.selezionato = null;
    this.prevPos = this.currentPos = null;
    this.dx = this.dy = 0;
  }

  private enableDrawing(e: MouseEvent) {
    // Vengono salvate le coordinate del mouse al momento della pressione del tasto
    this.prevPos = this.getFixedPos(e.clientX, e.clientY);
    // Si permette il disegno impostando il valore di disegna a true
    this.stato = 0;
  }

  private enableMovement(e: MouseEvent) {
    const realX = e.clientX - this.rect.left;
    const realY = e.clientY - this.rect.top;
    this.componenti.forEach((componente) => {
      if (componente.collide(realX, realY)) {
        const fixedPos = this.getFixedPos(e.clientX, e.clientY);
        this.dx = fixedPos.x - componente.posizione.x;
        this.dy = fixedPos.y - componente.posizione.y;
        this.selezionato = componente;
        this.stato = 1;
      }
    });
  }

  private removeElement(e: MouseEvent) {
    // Si elimina l'elemento selezionato, se esiste, che è stato disegnato per ultimo
    const realX = e.clientX - this.rect.left;
    const realY = e.clientY - this.rect.top;
    let daCancellare = this.elementoSelezionato(this.componenti, realX, realY);
    if (daCancellare !== -1) {
      this.componenti.splice(daCancellare, 1);
    } else {
      daCancellare = this.elementoSelezionato(this.wires, realX, realY);
      if (daCancellare !== -1) {
        this.wires.splice(daCancellare, 1);
      }
    }
  }

  private elementoSelezionato(elementi: any, realX: number, realY: number) {
    let daCancellare = -1;
    elementi.forEach(elemento => {
      if (elemento.collide(realX, realY)) {
        daCancellare = elementi.indexOf(elemento);
      }
    });
    return daCancellare;
  }

  private spostaElemento(e: MouseEvent) {
    const fixedPos = this.getFixedPos(e.clientX, e.clientY);
    const pos = { x: fixedPos.x - this.dx, y: fixedPos.y - this.dy };
    this.selezionato.updatePosition(pos);
  }

  private reDraw() {
    // Si pulisce il canvas
    this.context.clearRect(0, 0, Globals.width, Globals.height);
    // Viene ridisegnata la griglia
    this.drawGrid();
    // Vengono ridisegnati tutti i fili
    this.drawWires();
    // Vengono ridisegnati tutti i componenti
    this.drawComponents();

  }

  private drawGrid() {
    // Si imposta un tratto più leggero per tracciare la griglia
    this.context.lineWidth = 0.2;
    this.context.strokeStyle = Wire.colore;
    this.context.beginPath();

    for (let i = 0.5; i < Globals.height; i += Globals.spazio_linee) {
      this.context.moveTo(0, i);
      this.context.lineTo(Globals.width, i);
    }
    for (let i = 0.5; i < Globals.width; i += Globals.spazio_linee) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, Globals.height);
    }
    // Si disegna effettivamente
    this.context.stroke();
  }

  private drawComponents() {
    // Si disegna ogni componente ed anche i rispettivi input ed output graficamente
    this.componenti.forEach((componente) => {
      componente.draw(this.context);
    });
  }

  private drawWires() {
    // Si disegnano tutti i fili
    this.wires.forEach((wire) => {
      wire.draw(this.context);
    });
  }

  private getFixedPos(x: number, y: number) {
    // Posizioni relative al canvas
    const realX = x - this.rect.left;
    const realY = y - this.rect.top;

    // Spazio in mezzo alle linee
    const distGridX = realX % Globals.spazio_linee;
    const distGridY = realY % Globals.spazio_linee;
    let fixedPos: position;

    // Posizione arrotondata alla linee più vicine
    fixedPos = {
      x: realX - distGridX + (distGridX > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0),
      y: realY - distGridY + (distGridY > Globals.spazio_linee / 2 ? Globals.spazio_linee : 0)
    };
    return fixedPos;
  }

  private calcola_spostamento() {
    if (this.dx === 0 && this.dy === 0) {
      this.dx = Math.abs(this.prevPos.x - this.currentPos.x);
      this.dy = Math.abs(this.prevPos.y - this.currentPos.y);

      this.selezionato = new Wire(this.prevPos, this.currentPos, this.dx > this.dy);//
    }
  }

  public changeMode(value: number) {
    // 0: disegno, 1: cancellazione, 2: spostamento
    this.modalita = value;
    this.reset();
  }

  public selectComponent(componente: string, e: MouseEvent) {
    e.preventDefault();
    if (e.which === 1) {
      this.stato = 2;
      // bisogna rimuovere la class "checked" dal mat-button-group 
      this.selezionato = new Componente(4, '/assets/' + componente + '.svg', { x: 0, y: 0 });
      /*input.forEach((input) => {
        c.addInput(input[0], input[1]);
      });*/
      // In questo modo il cursore del mouse si trova al centro del componente
      const temp = this.getFixedPos(this.rect.left + this.selezionato.width / 2, this.rect.top + this.selezionato.height / 2);
      this.dx = temp.x;
      this.dy = temp.y;
    }
  }

}
