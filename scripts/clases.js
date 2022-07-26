// Clase Display
class Map{
  constructor(canvas, width, height, gridSize){
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = canvas.getContext('2d');

    this.grid = gridSize || [20, 20];
    this.rowSize = this.canvas.height/this.grid[0];
    this.colSize = this.canvas.width/this.grid[1];

    this.token;
  }

  renderGrid(){
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (var i = 0; i < this.canvas.height; i+=this.rowSize) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.height, i);
    }

    for (var i = 0; i <= this.canvas.width; i+=this.colSize) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.width);
    }
    this.ctx.stroke();
  }

  addToken(token){
    this.token = token;
  }

  showTokenMovement(event){
    if ((event.x <= this.token.x+this.token.radius && event.x >= this.token.x-this.token.radius)
      &&
      (event.y <= this.token.y+this.token.radius && event.y >= this.token.y-this.token.radius)) {
      this.token.showMovementArea = true;
      return true;
    }
  }

  update(){
    this.ctx.clearRect(0,0,canvas.width,canvas.height);
    this.renderGrid();

    let x = this.token.x;
    let y = this.token.y;
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgb(101, 199, 52)";
    this.ctx.arc(x, y, this.token.radius, 0, 2*Math.PI);
    this.ctx.fill();

    if (this.token.showMovementArea) {
      let movementRadius = (this.token.hojaPJ.speed/5) * this.rowSize;

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgb(194, 215, 18)";
      this.ctx.arc(this.token.x, this.token.y, movementRadius, 0, 2*Math.PI);
      this.ctx.stroke();
    }
  }
}



// Clase Token
class Token{
  constructor(x, y, radius, PJ){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.hojaPJ = PJ;

    this.showMovementArea = false;
  }

  movementController(event){
    if (this.showMovementArea) {
      this.x = event.x;
      this.y = event.y;
      this.showMovementArea = false;
    }
  }
}



// Clase de Hoja de Personaje
class HojaPJ{
  constructor(PJ){
    this.namePJ = PJ.namePJ;
    this.nameJugador = PJ.nameJugador;
    this.class = PJ.class;
    this.race = PJ.race;
    this.background = PJ.background;
    this.alignment = PJ.alignment;
    this.exp = PJ.exp;
    this.STR = PJ.STR;
    this.STRMod = PJ.STRMod;
    this.DEX = PJ.DEX;
    this.DEXMod = PJ.DEXMod;
    this.CON = PJ.CON;
    this.CONMod = PJ.CONMod;
    this.INT = PJ.INT;
    this.INTMod = PJ.INTMod;
    this.WIS = PJ.WIS;
    this.WISMod = PJ.WISMod;
    this.CHA = PJ.CHA;
    this.CHAMod = PJ.CHAMod;

    this.inspiration = false;

    this.proficiency = PJ.proficiency;

    this.CA = PJ.CA;
    this.initiative = PJ.initiative;
    this.speed = PJ.speed;
    this.HP = PJ.HP;
  }
}

// Clase Chat
class Chat{
  constructor(messagesBox){
    this.messages = [];
    this.messagesBox = messagesBox;
  }

  sendMessage(message){
    if (message) {
      let parrafo = document.createElement('p');
      parrafo.innerText = message;
      this.messagesBox.append(parrafo);

      this.messages.push(message);

      return true;
    }

    return false;
  }
}
