import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Componente } from './componente';
import { Wire } from './wire';
import { Globals, position, color } from '../globals';
import { Pin } from './pin';



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
  private current: any;
  private currentPins: Array<Pin>;
  private wires: Array<Wire>;
  private collegamenti: Array<Pin>;
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
    this.collegamenti = Array();
    this.currentPins = Array();
    this.current = null;
    this.dx = this.dy = 0;


    // Si imposta la larghezza e l'altezza del canvas
    console.log(window.outerWidth);
    canvasElement.width = Globals.width;
    canvasElement.height = Globals.height;

    // Si impostano alcuni parametri della linea
    this.context.lineWidth = 0.125; // spessore
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
            this.updatePins();
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
        case 0: this.newWire(e);
          this.gestisciDisegno(e);
          break;
        case 1: this.spostaElemento(e);
          this.reDraw();
          break;
        case 2: this.spostaElemento(e);
          this.reDraw();
          this.drawNewElement();
      }
    });

    canvasElement.addEventListener('mouseup', (e) => {
      e.preventDefault();
      if (e.which === 1) {
        if (!(this.prevPos == null || this.currentPos === null || (this.prevPos.x === this.currentPos.x && this.prevPos.y === this.currentPos.y))) {
          this.prova();
          this.addPins();
          this.wires.push(this.current);
        }
        else if (this.stato == 2) {
          this.addPins();
          this.componenti.push(this.current);
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

    canvasElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) Globals.scaling += 5;
      else if (Globals.scaling > 5) Globals.scaling -= 5;
      this.reDraw();
      this.reset();// ?
    });

  }

  private gestisciDisegno(e: MouseEvent) {
    // Si salvano le posizioni relative al canvas nella variabile currentPos
    let newPos = this.getFixedPos(e.clientX, e.clientY);
    this.currentPos.x = newPos.x;
    this.currentPos.y = newPos.y;
    // Vengono ridisegnati i componenti precedenti
    this.reDraw();
    // Calcola lo spostamento avvenuto
    this.calcola_spostamento();
    // Viene disegnato il nuovo filo
    this.drawNewElement();
  }

  private reset() {
    // Viene impedita la possibilità di disegnare impostando il valore di disegna a false
    this.stato = -1;
    this.current = null;
    this.currentPins = Array();
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
    const canvasPos = this.getCanvasPos(e.clientX, e.clientY);
    this.componenti.forEach((componente) => {
      if (componente.collide(canvasPos.x, canvasPos.y)) {
        const fixedPos = this.getFixedPos(e.clientX, e.clientY);
        this.dx = fixedPos.x - componente.posizione.x;
        this.dy = fixedPos.y - componente.posizione.y;
        this.current = componente;
        this.stato = 1;
      }
    });
  }

  private removeElement(e: MouseEvent) {
    // Si elimina l'elemento selezionato, se esiste, che è stato disegnato per ultimo
    const canvasPos = this.getCanvasPos(e.clientX, e.clientY);
    let daCancellare = this.elementoSelezionato(this.componenti, canvasPos.x, canvasPos.y);
    if (daCancellare !== null) {
      daCancellare.kill();
      this.componenti.splice(this.componenti.indexOf(daCancellare), 1);
    } else {
      daCancellare = this.elementoSelezionato(this.wires, canvasPos.x, canvasPos.y);
      if (daCancellare !== null) {
        daCancellare.kill();
        this.wires.splice(this.wires.indexOf(daCancellare), 1);
      }
    }
  }

  private elementoSelezionato(elementi: Array<Componente | Wire>, canvasX: number, canvasY: number) {
    let daCancellare = null;
    elementi.forEach(elemento => {
      if (elemento.collide(canvasX, canvasY)) {
        daCancellare = elemento;
      }
    });
    return daCancellare;
  }

  private spostaElemento(e: MouseEvent) {
    const fixedPos = this.getFixedPos(e.clientX, e.clientY);
    const pos = { x: fixedPos.x - this.dx, y: fixedPos.y - this.dy };
    this.current.updatePosition(pos);
  }

  private getCanvasPos(x: number, y: number) {
    return { x: (x - this.rect.left) / Globals.scaling, y: (y - this.rect.top) / Globals.scaling };
  }
  private getFixedPos(x: number, y: number) {
    let canvasPos = this.getCanvasPos(x, y);
    return { x: Math.round(canvasPos.x), y: Math.round(canvasPos.y) };
  }

  private calcola_spostamento() {
    if (this.dx === 0 && this.dy === 0) {
      this.dx = Math.abs(this.prevPos.x - this.currentPos.x);
      this.dy = Math.abs(this.prevPos.y - this.currentPos.y);
      this.current.spostamento_orizzontale = this.dx > this.dy;
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
      this.newComponent(componente);
    }
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
    // Vengono ridisegnati tutti i collegamenti
    this.drawPins();
  }

  private drawGrid() {
    // Si imposta un tratto più leggero per tracciare la griglia
    this.context.lineWidth = 0.2;
    this.context.strokeStyle = "#000000";
    this.context.beginPath();

    for (let i = 0.5; i < Globals.height; i += Globals.scaling) {
      this.context.moveTo(0, i);
      this.context.lineTo(Globals.width, i);
    }
    for (let i = 0.5; i < Globals.width; i += Globals.scaling) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, Globals.height);
    }
    // Si disegna effettivamente
    this.context.stroke();
  }

  private drawComponents() {
    // Si disegna ogni componente
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

  private drawPins() {
    // Si disegnano tutti i collegamenti
    this.collegamenti.forEach((pin) => {
      pin.draw(this.context);
    });
  }

  public drawNewElement() {
    // Si disegna il nuovo componente ed i relativi pin
    this.current.draw(this.context);
    this.currentPins.forEach((pin) => {
      pin.draw(this.context);
    });
  }


  public addPins() {
    this.currentPins.forEach((pin) => {
      this.collegamenti.push(pin);
    });
  }

  public updatePins() {
    for (let i = this.collegamenti.length - 1; i >= 0; i--) {
      if (!this.collegamenti[i].updateParents())
        this.collegamenti.splice(i, 1);
    }
    for (let i = this.collegamenti.length - 1; i >= 0; i--) {
      this.collegamenti[i].updateNext();
    }

  }

  public newComponent(componente: string) {
    // Si può fare un'opzione per scegliere il numero di input, il componente si adatterà automaticamente
    let numero_input = 2;
    if (componente.startsWith("INPUT"))
      numero_input = 0;
    this.current = new Componente(numero_input, componente, { x: 0, y: 0 });
    this.addInputs(numero_input);
    // In questo modo il cursore del mouse si trova al centro del componente
    const temp = this.getFixedPos(this.rect.left + this.current.getWidth() / 2, this.rect.top + this.current.getHeight() / 2);
    this.dx = temp.x;
    this.dy = temp.y;

  }

  public addInputs(numero_input: number) {
    let output = new Pin({ x: this.current.width, y: this.current.height / 2 }, this.current);
    for (let i = 1; i <= Math.ceil(numero_input / 2); i++) {
      let input = new Pin({ x: 0, y: i }, this.current);
      input.addNext(output);
      this.currentPins.push(input);
    }

    for (let i = Math.floor(numero_input / 2) + 2; i < this.current.height; i++) {
      let input = new Pin({ x: 0, y: i }, this.current);
      input.addNext(output);
      this.currentPins.push(input);
    }
    this.currentPins.push(output);
  }

  public newWire(e: MouseEvent) {
    if (this.currentPos === null) {
      this.currentPos = this.getFixedPos(e.clientX, e.clientY);
      this.current = new Wire(this.prevPos, this.currentPos);
      let a = new Pin(this.current.sorgente, this.current);
      let b = new Pin(this.current.destinazione, this.current);
      a.addNext(b); // 1 push
      b.addNext(a); // 2 push
      this.currentPins.push(a);
      this.currentPins.push(b);
    }
  }


  public prova() {
    this.collegamenti.forEach((pin) => {
      for (let i = this.currentPins.length - 1; i >= 0; i--) {
        if (this.currentPins[i].equals(pin)) {
          this.currentPins[i].next.forEach((next) => {
            pin.addNext(next);
            next.changeNext(pin);
          });
          this.currentPins[i].parent.forEach((parent) => {
            pin.addParent(parent);
          });
          pin.updateColor();
          this.currentPins.splice(i, 1);
        }
      }
    })

  }

  public resetPins() {
    this.collegamenti.forEach((pin) => {
      pin.colore_DFS = color.White;
      pin.resetValue();
    });
  }
  public resetComponents() {
    this.componenti.forEach((componente) => {
      componente.inputs = Array();
    });

  }

  public getInputs() {
    let inputs = Array<Pin>();
    this.collegamenti.forEach((pin) => {
      if (pin.value != -1) {
        inputs.push(pin);
      }
    });
    return inputs;

  }

  public BFSVisit() {
    this.resetPins();
    this.resetComponents();
    let inputs = this.getInputs();
    while (inputs.length != 0) {
      let input = inputs.pop();
      input.next.forEach((next) => {
        if (next.value === -1) {
          let componente = next.getComponent();
          if (componente instanceof Componente) {

            // Non è un output
            if (next.posizione.x != componente.posizione.x + componente.width) {
              componente.inputs.push(next);
              next.value = input.value;
            }
            else next.value = componente.evaluate();
          }
          else next.value = input.value;
          if (next.value != -1) inputs.push(next);
        }
      });
    }
  }

  public evaluateCircuit() {
    if (!this.hasCycle()) {
      this.BFSVisit();
      this.collegamenti.forEach((pin) => {
        pin.updateParentProperties();
      })
    }
    else {
      this.wires.forEach((wire) => {
        wire.undefinedState();
      })
    }
    this.reDraw();
  }

  public hasCycle() {
    let has_cycle: boolean = false;
    this.resetPins();
    this.collegamenti.forEach((pin) => {
      if (pin.colore_DFS === color.White)
        has_cycle = this.DFSVisit(pin, pin) || has_cycle;
    });
    return has_cycle;
  }

  public DFSVisit(pin: Pin, prev: Pin) {
    let has_cycle: boolean = false;
    pin.colore_DFS = color.Gray;
    pin.next.forEach((next) => {
      if (next.colore_DFS === color.White)
        has_cycle = this.DFSVisit(next, pin) || has_cycle;
      else if ((!next.equals(prev) || pin.isConnectedTo(prev) == 2) && next.colore_DFS === color.Gray)
        has_cycle = true;

    });
    pin.colore_DFS = color.Black;
    return has_cycle;
  }



}
