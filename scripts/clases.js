// Clase Display
class Map{
  constructor(canvas, width, height, gridSize, tokens){
    this.canvas = canvas;
    this.canvas.width = Math.ceil(width/gridSize)*gridSize;
    this.canvas.height = Math.ceil(height/gridSize)*gridSize;
    this.ctx = canvas.getContext('2d');

    this.layers = {
      'map&background': document.createElement('canvas'),
      'objects&tokens': document.createElement('canvas'),
      'dmInfo': document.createElement('canvas')
    };
    Object.keys(this.layers).forEach((layer) => {
      this.layers[layer].width = this.canvas.width;
      this.layers[layer].height = this.canvas.height;
    });
    this.activeLayer = this.layers['objects&tokens'];

    this.scale = 1;
    this.mousedown = false;
    this.clickOffsetX = 0;
    this.clickOffsetY = 0;

    this.gridSize = gridSize || 60;

    this.tokens = tokens || [];
    this.drawings = [];
    this.images = [];

    this.utilities = {
      select: {
        active: true,
        options: {
          select_move: true,
          pan_view: false
        }
      },
      layers: {
        active: false,
        options: {
          map: false,
          objects: true,
          dm_layer: false
        }
      },
      draw: {
        active: false,
        options: {
          rect: false,
          circle: false,
          path: false,
          polygon: false,
          text: false,
          clear: false
        },
        variables: {
          shape: undefined,
          startX: 0,
          startY: 0,
          color: 'black',
          weight: '2px',
          font: 'Arial',
          text: ''
        }
      },
      measure: {
        active: false,
        options: {
          snap_center: false,
          snap_corner: false,
          no_snap: false
        }
      },
      fog: {
        active: false,
        options: {
          reveal: false,
          polygon_reveal: false,
          hide: false,
          reset: false
        }
      }
    }

    // Handlers de eventos.
    this.handleMouseDown = (e) => {
      if (this.utilities.select.active) {
        this.movementController(e);
      }else if (this.utilities.draw.active) {
        this.drawShapes(e);
      }
    };

    this.handleMouseMove = (e) => {
      if (this.utilities.select.active) {
        this.movementController(e);
      }else if (this.utilities.draw.active) {
        this.drawShapes(e);
      }
    };

    this.handleMouseUp = (e) => {
      if (this.utilities.select.active) {
        this.movementController(e);
      }else if (this.utilities.draw.active) {
        this.drawShapes(e);
      }
    };

    this.handleMouseLeave = (e) => {
      if (this.utilities.select.active) {
        this.movementController(e);
      }
    };

    this.handleWheel = (e) => this.zoom(e);
  }

  setUtilityOpt(toChange, utility, option){
    switch (toChange) {
      case 'utility':
        Object.keys(this.utilities).map((key) => {
          if (key == utility) {
            map.utilities[key].active = true;
          }else{
            map.utilities[key].active = false;
          }
        });
        break;


      case 'utility_opt':
        Object.keys(this.utilities[utility]['options']).map((key) => {
          if (key == option) {
            this.utilities[utility]['options'][key] = true;
          }else {
            this.utilities[utility]['options'][key] = false;
          }
        });
        break;
    }
  }

  renderGrid(){
    this.ctx.strokeStyle = 'black';

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (var i = 0; i < this.canvas.height; i+=this.gridSize) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.height, i);
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.width);
    }
    this.ctx.stroke();
  }

  addToken(token){
    this.tokens.push(token);
  }

  addImage(img){
    this.images.push(img);
  }

  setActiveLayer(layer){
    console.log(layer);
    this.activeLayer = this.layers[layer];
  }

  zoom(event, value){
    if (event.type == 'wheel' && event.ctrlKey) {
      event.preventDefault();
      if (event.wheelDelta > 0) {
        this.scale+=0.1;
      }else {
        this.scale-=0.1;
      }
    }else if (value) {
      this.scale = value;
    }
  }

  movementController(event){
    if (event.type == 'mousedown' && (this.utilities.select.options.pan_view || event.ctrlKey)) {
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

  drawShapes(event){

    if (event.type == 'mousedown' && this.utilities.draw.active) {              // Evento de mousedown.
      if (!this.utilities.draw.options.polygon) {                               // Si la opcion de draw no es hacer un poligono.
        this.utilities.draw.variables.startX = event.offsetX;
        this.utilities.draw.variables.startY = event.offsetY;

        this.clickOffsetX = event.clientX;
        this.clickOffsetY = event.clientY;

        this.mousedown = true;

      }else if (this.utilities.draw.options.polygon && event.button == 0) {     // Si se quiere dibujar un poligono y se apreto el click izquierdo.
        if (!this.utilities.draw.variables.shape) {
          this.utilities.draw.variables.shape = new Path2D();

          this.utilities.draw.variables.shape.moveTo(event.offsetX, event.offsetY);
          this.utilities.draw.variables.shape.lineTo(event.offsetX+1, event.offsetY+1);
        }else if (this.utilities.draw.variables.shape) {

          this.utilities.draw.variables.shape.lineTo(event.offsetX, event.offsetY);

        }
      }else if (this.utilities.draw.options.polygon && event.button == 2) {     // Si se apreto el boton derecho y se esta en la opcion de poligono.
        this.mousedown = false;
        this.drawings.push(this.utilities.draw.variables.shape);
        this.utilities.draw.variables.shape = undefined;
        this.utilities.draw.variables.startX = 0;
        this.utilities.draw.variables.startY = 0;
      }else if (this.utilities.draw.options.text && event.button == 0) {        // Si se quiere agregar texto.
        this.utilities.draw.variables.shape = new Path2D();
        this.utilities.draw.variables.startX = event.clienx;
        this.utilities.draw.variables.startY = event.clienx;

        this.utilities.draw.variables.shape.fillText('Hola Mundo', this.utilities.draw.variables.startX, this.utilities.draw.variables.startY);
      }

    }else if (event.type == 'mousemove' && this.mousedown) {                    // Evento de mousemove
      let startX = this.utilities.draw.variables.startX;
      let startY = this.utilities.draw.variables.startY;
      let endX = (event.clientX - this.canvas.offsetLeft)/this.scale;
      let endY = (event.clientY - this.canvas.offsetTop)/this.scale;
      let distanceX = (event.clientX - this.clickOffsetX)/this.scale;
      let distanceY = (event.clientY - this.clickOffsetY)/this.scale;
      let distance = Math.floor(Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)));

        // Si se quiere dibujar un rectangulo.
      if (this.utilities.draw.options.rect) {
        let rectangle = new Path2D();

        rectangle.rect(startX, startY, distanceX, distanceY);

        this.utilities.draw.variables.shape = rectangle;

        // Si se quiere dibujar un circulo
      }else if (this.utilities.draw.options.circle) {
        let circle = new Path2D();

        circle.arc(startX, startY, distance, 0, Math.PI*2);

        this.utilities.draw.variables.shape = circle;

        // Si se quiere dibujar a mano libre.
      }else if (this.utilities.draw.options.path){
        if (!this.utilities.draw.variables.shape) {
          this.utilities.draw.variables.shape = new Path2D();
        }

        let line = new Path2D();
        line.moveTo(startX, startY);
        line.lineTo(endX, endY);

        this.utilities.draw.variables.shape.addPath(line);

        this.utilities.draw.variables.startX = endX;
        this.utilities.draw.variables.startY = endY;

      }

    }else if (event.type == 'mouseup' && this.mousedown && !this.utilities.draw.options.polygon) {  // Evento de mouseup
      this.mousedown = false;
      this.drawings.push(this.utilities.draw.variables.shape);
      this.utilities.draw.variables.shape = undefined;
      this.utilities.draw.variables.startX = 0;
      this.utilities.draw.variables.startY = 0;
    }else if (event.type == 'keypress' && this.utilities.draw.active) {

    }
  }

  update(){
    this.ctx.clearRect(0,0,canvas.width,canvas.height);
    this.canvas.style.transform = `scale(${this.scale})`;

    this.ctx.globalCompositeOperation='source-over';

    this.renderGrid();


    // Dibujado de los tokens
    this.tokens.forEach((token) => {
      let x = token.x;
      let y = token.y;

      // Snap del token a la grilla
      if (token.dropped) {
        x = ((Math.trunc(token.x/this.gridSize))*this.gridSize)+(this.gridSize/2);
        y = ((Math.trunc(token.y/this.gridSize))*this.gridSize)+(this.gridSize/2);
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

      // Visualizacion del area de movimiento del token.
      if (token.showMovementArea) {
        let movementRadius = (token.hojaPJ.speed/5) * this.gridSize;

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgb(194, 215, 18)";
        this.ctx.arc(token.x, token.y, movementRadius, 0, 2*Math.PI);
        this.ctx.stroke();
      }
    });

    // Visualizacion de los dibujos.
    if(this.utilities.draw.variables.shape){
      this.ctx.stroke(this.utilities.draw.variables.shape);
    }
    this.drawings.forEach((drawing) => {
      this.ctx.stroke(drawing);
    });

    // Visualizacion de las imagenes.
    this.images.forEach((mapImg) => {
      let originX = mapImg.x-(mapImg.img.width/2);
      let originY = mapImg.y-(mapImg.img.height/2);
      let imgWidth = this.canvas.width;
      let imgHeight = this.canvas.height;

      this.ctx.globalCompositeOperation='destination-over';

      this.ctx.drawImage(mapImg.img, originX, originY, imgWidth, imgHeight);
      // if (mapImg.gizmoState) {
      //   let topLeft = [originX, originY];
      //   let topRight = [originX+mapImg.img.width, originY];
      //   let bottomLeft = [originX, originY+mapImg.img.height];
      //   let bottomRight = [originX+mapImg.img.width, originY+mapImg.img.height];

      //   this.ctx.beginPath();
      //   this.ctx.strokeStyle = "#54c3e8";

      //   this.ctx.arc(topLeft[0], topLeft[1], 10, 0, Math.PI*2);
      //   // this.ctx.arc(topRight[0], topRight[1], 10, 0, Math.PI*2);
      //   // this.ctx.arc(bottomLeft[0], bottomLeft[1], 10, 0, Math.PI*2);
      //   // this.ctx.arc(bottomRight[0], bottomRight[1], 10, 0, Math.PI*2);

      //   this.ctx.fill();
      // }
    });
  }
}



// Clase de imagen
class mapImage{
  constructor(img, x, y){
    this.img = img;
    this.x = x;
    this.y = y;

    this.gizmoState = false;
  }

  toggleGizmos(){
    this.gizmoState = (this.gizmoState) ? false : true;
  }

  transform(){

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
