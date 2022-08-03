// Clase Display
class Map{
  constructor(canvas, width, height, gridSize, tokens){
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = canvas.getContext('2d');

    this.scale = 1;
    this.mousedown = false;
    this.clickOffsetX = 0;
    this.clickOffsetY = 0;

    this.grid = gridSize || [20, 20];
    this.rowSize = this.canvas.height/this.grid[0];
    this.colSize = this.canvas.width/this.grid[1];

    this.tokens = tokens || [];

    this.toolbar = {
      select: true,
      layers: false,
      draw: false,
      zoom: false,
      distances: false,
      fog: false,
      turns: false,
      rolls: false,
      info: false,
    }

    this.handleMovement = (e) => this.movementController(e);
    this.handleZoom = (e) => this.zoom(e);
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
    this.tokens.push(token);
  }

  zoom(event){
    if (event.type == 'wheel' && event.ctrlKey) {
      event.preventDefault();
      if (event.wheelDelta > 0) {
        this.scale+=0.1;
      }else {
        this.scale-=0.1;
      }
    }
  }

  movementController(event){
    if (event.type == 'mousedown' && event.ctrlKey) {
      this.canvas.style.cursor = 'move';
      this.mousedown = true;
      this.clickOffsetX = event.clientX;
      this.clickOffsetY = event.clientY;
    }else if (event.type == 'mousemove' && this.mousedown) {
      this.canvas.style.left = (this.canvas.offsetLeft - (this.clickOffsetX - event.clientX)) + 'px';
      this.canvas.style.top = (this.canvas.offsetTop - (this.clickOffsetY - event.clientY)) + 'px';
      this.clickOffsetX = event.clientX;
      this.clickOffsetY = event.clientY;
    }else if ((event.type == 'mouseup' || event.type == 'mouseleave') && this.mousedown) {
      this.mousedown = false;
      this.canvas.style.cursor = 'auto';
    }
  }

  update(){
    this.ctx.clearRect(0,0,canvas.width,canvas.height);
    this.canvas.style.transform = `scale(${this.scale})`;

    this.renderGrid();

    // Dibujado de los tokens
    this.tokens.forEach((token) => {
      let x = token.x;
      let y = token.y;

      // Snap del token a la grilla
      if (token.dropped) {
        x = ((Math.trunc(token.x/this.rowSize))*this.rowSize)+(this.rowSize/2);
        y = ((Math.trunc(token.y/this.colSize))*this.colSize)+(this.colSize/2);
        token.x = x;
        token.y = y;
        token.dropped = false;
      }

      this.ctx.beginPath();

      // Cargado de imagen de token si es que tiene.
      if (token.image) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        tempCtx.drawImage(token.image, (x-token.radius), (y-token.radius), token.radius*2, token.radius*2);

        this.ctx.fillStyle = this.ctx.createPattern(tempCanvas, 'no-repeat');
      }else {
        this.ctx.fillStyle = "rgb(101, 199, 52)";
      }

      this.ctx.arc(x, y, token.radius, 0, 2*Math.PI);
      this.ctx.fill();

      if (token.showMovementArea) {
        let movementRadius = (token.hojaPJ.speed/5) * this.rowSize;

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgb(194, 215, 18)";
        this.ctx.arc(token.x, token.y, movementRadius, 0, 2*Math.PI);
        this.ctx.stroke();
      }
    })
  }
}



// Clase Token
class Token{
  constructor(id, x, y, radius, PJ, img){
    this.id = id || 0;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.hojaPJ = PJ;
    this.image;

    if (img || PJ.image) this.setImage(img || PJ.image);

    this.mousedown = false;
    this.dropped = true;

    this.menuHidden = true;
    this.showMovementArea = false;

    this.handleMovement = (event) => { return this.movementController(event); };
    this.handleMenu = (event) => {
      let top = this.y-this.radius;
      let right = this.x+this.radius;
      let bottom = this.y+this.radius;
      let left = this.x-this.radius;

      if(event.type == 'dblclick' && (left < event.offsetX && event.offsetX < right && top < event.offsetY && event.offsetY < bottom)){
        this.showMenu();
      }
    };
  }

  movementController(event){
    let top = this.y-this.radius;
    let right = this.x+this.radius;
    let bottom = this.y+this.radius;
    let left = this.x-this.radius;

    if (event.type == 'mousedown' && (left < event.offsetX && event.offsetX < right && top < event.offsetY && event.offsetY < bottom)) {
      this.mousedown = true;

      this.closeMenu();

      return true;
    }else if (event.type == 'mousemove' && this.mousedown) {
      this.x = event.offsetX;
      this.y = event.offsetY;
    }else if ((event.type == 'mouseup' || event.type == 'mouseleave') && this.mousedown) {
      this.mousedown = false;
      this.dropped = true;
    }
    return false;
  }

  setImage(img){
    this.image = new Image();
    this.image.src = img;
  }

  showMenu(){
    if (this.menuHidden) {
      let menu = document.createElement('span');
      menu.setAttribute('token_target', this.id);
      menu.innerHTML = `
      <ul>
      <li id="TM_movement">Show Movement</li>
      <li id="TM_info">Show PJ info</li>
      <li id="TM_image">Change token image</li>
      </ul>
      `;
      menu.classList.add('token_menu');
      menu.style.left = (this.x+20) + 'px';
      menu.style.top = (this.y+10) + 'px';
      document.body.append(menu);

      this.menuHidden = false;
    }
  }

  closeMenu(){
    let menu = document.querySelector(`span[token_target="${this.id}"]`);
    if (menu) {
      menu.remove();
      this.menuHidden = true;
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
  constructor(user, messagesBox){
    this.user = user;
    this.messages = [];
    this.messagesBox = messagesBox;
  }

  sendMessage(message){
    if (message) {
      let parrafo = document.createElement('p');
      parrafo.innerText = `${this.user.name}: ${message}`;
      this.messagesBox.append(parrafo);

      this.messages.push(message);

      return true;
    }

    return false;
  }
}



// Clase User
class User{
  constructor(name, dm, tokens){
    this.name = name;
    this.isDM = dm || false;
    this.tokens = tokens || [];
  }
}



// Clase Engine
class Engine{
  constructor(time_step, update, render){
    this.accumulated_time        = 0;                                           // Tiempo que se acumulo desde la ultima actualizacion.
    this.animation_frame_request = undefined;                                   // Referencia al AFR
    this.time                    = undefined;                                   // El timestamp mas reciente del loop de ejecucion.
    this.time_step               = time_step;                                   // Tiempo de un cambio de frame (FPS)

    this.updated = false;                                                       // Booleano para registrar si la funcion de actualizacion se ejecuto o no.

    this.update = update;                                                       // La funcion de actualizacion.
    this.render = render;                                                       // La funcion de renfer.

    this.run = function(time_stamp) {

      this.accumulated_time += time_stamp - this.time;
      this.time = time_stamp;

      if (this.accumulated_time >= this.time_step * 3) {

        this.accumulated_time = this.time_step;

      }

      while(this.accumulated_time >= this.time_step) {

        this.accumulated_time -= this.time_step;

        this.update(time_stamp);

        // this.updated = true;

      }

      // if (this.updated) {
      //
      //   this.updated = false;
      //   this.render(time_stamp);
      //
      // }

      this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

    };

    this.handleRun = (time_step) => { this.run(time_step); };
  }

  start(){

    this.accumulated_time = this.time_step;
    this.time = window.performance.now();
    this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

  }

  stop(){
    window.cancelAnimationFrame(this.animation_frame_request);
  }
}
