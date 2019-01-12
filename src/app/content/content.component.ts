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

  @ViewChild('foglio') foglio: ElementRef; // Riferimento al canvas

  private currentPos: position; // ultima posizione del cursore del mouse
  private prevPos: position; // posizione precedente del cursore del mouse
  private context: CanvasRenderingContext2D; // oggetto per usare i metodi grafici (draw, drawImage, stroke, fill, etc)
  private componenti: Array<Componente>; // array dei componenti logici (AND, OR, etc) attualmente presenti nel canvas
  private wires: Array<Wire>; // come sopra ma per i wires
  private collegamenti: Array<Pin>; // come sopra ma per i pins
  private current: any; // oggetto temporaneo usato prima di rendere effettivo l'inserimento di un elemento (componente o filo)
  private currentPins: Array<Pin>; // come sopra ma dei pins
  
  private rect: ClientRect; // oggetto che contiene informazioni del canvas (es. posizione) in modo che le posizioni degli elementi abbiano come riferimento il canvas
  private modalita: number; // modalità selezionata dalla toolbar (wire, delwire, movewire, play)
  private stato: number; // stato della modalità (es. se dopo aver cliccato wire si sta disegnando o meno)
  private dx: number; // variabile utilizzata per esprimere la differenza tra la x della posizione precedente e quella successiva
  private dy: number; // variabile utilizzata per esprimere la differenza tra la y della posizione precedente e quella successiva



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
      e.preventDefault(); // Inibisce il comportamento di default
      if (e.which === 1) // Controlla se effettivamente è stato premuto il tasto sinistro del mouse
        switch (this.modalita) { 
          // 0: abilitazione_disegno_wire , 1: cancellazione_elemento, 2: abilitazione_movimento
          case 0: this.enableDrawing(e.clientX, e.clientY);
            break;
          case 1: this.removeElement(e.clientX, e.clientY);
            this.updatePins(); // dopo aver rimosso un elemento dobbiamo ri-controllare i pins
            this.reDraw(); // si ridisegna il tutto
            break;
          case 2: this.enableMovement(e.clientX, e.clientY); // abilita lo spostamento e prepara le variabili
            break;
        }
    });

    canvasElement.addEventListener('mousemove', (e) => {
      e.preventDefault(); // Inibisce il comportamento di default
      switch (this.stato) { 
        // 0: disegno_wire_in_corso, 1: spostamento_elemento_in_corso, 2: inserimento_componente_in_corso
        case 0: this.newWire(e.clientX, e.clientY);
          this.gestisciDisegno(e.clientX, e.clientY);
          break;
        case 1: this.spostaElemento(e.clientX, e.clientY);
          this.reDraw();
          break;
        case 2: this.spostaElemento(e.clientX, e.clientY);
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

  private gestisciDisegno(clientX, clientY) { //metodo che aggiorna continuamente la posizione del Wire temporaneo
    let newPos = this.getFixedPos(clientX, clientY); // si prende la nuova posizione "normalizzata"
    this.currentPos.x = newPos.x; // si aggiorna la x 
    this.currentPos.y = newPos.y; // e la y 
    this.reDraw(); // Vengono ridisegnati i componenti precedenti
    this.calcola_spostamento(); // Calcola lo spostamento avvenuto
    this.drawNewElement(); // Viene disegnato il nuovo filo
  }

  private reset() {
    // Viene impedita la possibilità di disegnare impostando il valore di disegna a false
    this.stato = -1;
    this.current = null;
    this.currentPins = Array();
    this.prevPos = this.currentPos = null;
    this.dx = this.dy = 0;
  }

  private enableDrawing(clientX, clientY) {
    // Vengono salvate le coordinate del mouse al momento della pressione del tasto
    this.prevPos = this.getFixedPos(clientX, clientY);
    // Si permette il disegno impostando il valore di stato a 0
    this.stato = 0;
  }

  private enableMovement(clientX, clientY) {
    const canvasPos = this.getCanvasPos(clientX, clientY); //posizione NON "normalizzata" relativa al canvas
    this.componenti.forEach((componente) => {
      if (componente.collide(canvasPos.x, canvasPos.y)) { // si controlla se in quella posizione c'è un componente
        const fixedPos = this.getFixedPos(clientX, clientY); // posizione "normalizzata"
        this.dx = fixedPos.x - componente.posizione.x; // la differenza viene usata per mantenere la distanza tra il vertice in alto a sx del componente e il cursore
        this.dy = fixedPos.y - componente.posizione.y; // in modo da rendere lo spostamento graficamente più godibile (altrimenti il cursore sarebbe sempre in alto a sx del componente)
        this.current = componente; // si setta current al componente selezionato
        this.stato = 1; // infine si abilita effettivamente il movimento
      }
    });
  }

  private removeElement(clientX, clientY) { // metodo che elimina l'elemento selezionato, se esiste, che è stato disegnato per ultimo
    const canvasPos = this.getCanvasPos(clientX, clientY); // posizione NON "normalizzata" (riferita relativamente al canvas)
    let daCancellare = this.elementoSelezionato(this.componenti, canvasPos.x, canvasPos.y); // ricerca, nell'array dei componenti, il componente che ha al suo interno la posizione del mouse
    if (daCancellare !== null) {
      daCancellare.kill(); // settando a false l'attributo alive, la successiva chiamata ad updatePins provvederà a rimuovere l'elemento dai Pin
      this.componenti.splice(this.componenti.indexOf(daCancellare), 1); // toglie l'elemento dall'array (1 è il numero di occorrenze da eliminare)
    } else {  // lo stesso viene fatto per i wires che però hanno meno priorità
      daCancellare = this.elementoSelezionato(this.wires, canvasPos.x, canvasPos.y);
      if (daCancellare !== null) {
        daCancellare.kill();
        this.wires.splice(this.wires.indexOf(daCancellare), 1);
      }
    }
  }

  private elementoSelezionato(elementi: Array<Componente | Wire>, canvasX: number, canvasY: number) { //si ricerca un elemento e si restituisce
    let daCancellare = null;
    elementi.forEach(elemento => {
      if (elemento.collide(canvasX, canvasY)) {
        daCancellare = elemento;
      }
    });
    return daCancellare;
  }

  private spostaElemento(clientX, clientY) {
    const fixedPos = this.getFixedPos(clientX, clientY); //si prende la posizione "normalizzata"
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

  private calcola_spostamento() { // si controlla la differenza tra la posizione precente e quella attuale per disegnare i Wire in modo più intuitivo
    if (this.dx === 0 && this.dy === 0) { // se non si è fatto un primo spostamento
      this.dx = Math.abs(this.prevPos.x - this.currentPos.x); //differenza delle x
      this.dy = Math.abs(this.prevPos.y - this.currentPos.y); //differenza delle y
      this.current.spostamento_orizzontale = this.dx > this.dy; // prevalenza dello spostamento orizzontale
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
    
    this.context.clearRect(0, 0, Globals.width, Globals.height); // Si pulisce il canvas (si rimuove TUTTO)
    this.drawGrid(); // Viene ridisegnata la griglia
    this.drawWires(); // Vengono ridisegnati tutti i fili
    this.drawComponents(); // Vengono ridisegnati tutti i componenti
    this.drawPins(); // Vengono ridisegnati tutti i collegamenti
  }

  private drawGrid() {
    this.context.lineWidth = 0.2; // Si imposta un tratto più leggero per tracciare la griglia
    this.context.strokeStyle = "#000000"; // Si reimposta il colore a nero
    this.context.beginPath(); // inizia un nuovo percorso in modo che vengano scartate le modifiche del percorso precedente

    for (let i = 0.5; i < Globals.height; i += Globals.scaling) { //disegna le linee orizzantali
      this.context.moveTo(0, i); // sposta il punto di riferimento nelle coordinate indicate dai parametri
      this.context.lineTo(Globals.width, i); // disegna dal punto di riferimento (linea sopra) fino alle coordinate indicate nei parametri
    }
    for (let i = 0.5; i < Globals.width; i += Globals.scaling) { //disegna le linee verticali
      this.context.moveTo(i, 0);
      this.context.lineTo(i, Globals.height);
    }
    this.context.stroke(); // si confermano i tracciati indicati da dopo il beginPath e si conclude il percorso
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
    // Si disegna il nuovo elemento (componente o Wire) ed i relativi pin
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

  public newWire(clientX, clientY) { // metodo per aggiungere un nuovo wire
    if (this.currentPos === null) { // controllo per evitare di creare più di una volta il Wire
      this.currentPos = this.getFixedPos(clientX, clientY); // ottiene la posizione corretta per stare nella griglia
      this.current = new Wire(this.prevPos, this.currentPos); // si crea l'oggetto Wire con i due PUNTATORI prevPos e currentPos quindi una eventuale modifica aggiornerebbe il valore in Wire
      let a = new Pin(this.current.sorgente, this.current); // viene creato un Pin in prevPos che fa riferimento al Wire current (anche qua usiamo i puntatori per eventualmente aggiornare il valore)
      let b = new Pin(this.current.destinazione, this.current); // viene creato un Pin in currentPos che fa riferimento al Wire current (anche qua usiamo i puntatori per eventualmente aggiornare il valore)
      a.addNext(b); // nel grafo dei percorsi viene creato un collegamento tra i due pin 
      b.addNext(a); // in ambo i sensi
      this.currentPins.push(a); // si aggiunge il Pin a nell'array dei Pins temporanei
      this.currentPins.push(b); // idem per b
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
