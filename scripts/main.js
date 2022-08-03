// Constantes para obtener elementos del DOM.
const canvas = document.getElementById('canvas');
const chatLog = document.getElementById('messages');
const chatBtn = document.getElementById('chatBtn');
const chatBox = document.getElementById('chatInput');
const toolbarMenu = document.querySelectorAll('#toolbar ul li');

// Instanciación de objetos.
const PJs = [new HojaPJ(garret), new HojaPJ(leosariph)];
const tokens = [
  new Token(0, 20, 20, 30, PJs[0], 'assets/img/tokens/Garret_token.jpg'),
  new Token(1, 100, 100, 30, PJs[1], 'assets/img/tokens/Leosariph_token.jpg')
];
const map = new Map(canvas, 1200, 1200, [20, 20], tokens);
map.renderGrid();
map.update();

const engine = new Engine(1000/30, update, render);

const user = new User('Facu', true, tokens);
const chat = new Chat(user, chatLog);



// Definición de Event Listeners.
// Evento para enviar mensaje por chat clickeando el boton de "Send".
chatBtn.addEventListener('click', () =>{
  if (chat.sendMessage(chatBox.value)) {
    chatBox.value = '';
  }
});
// Evento para enviar el mensaje por chat al dar Enter en el input de mensaje.
chatBox.addEventListener('keypress', (e) =>{
  if(e.keyCode == 13) {
    if (chat.sendMessage(chatBox.value)) {
      chatBox.value='';
    }
  }
})

// Eventos para manejar el movimiento de los token.
canvas.addEventListener('mousedown', (e)=>{
  let clickCanvas = true;
  let tokenHolded = false;
  tokens.slice().reverse().forEach((token) => {
    if(!tokenHolded){
      if(token.handleMovement(e)){
        clickCanvas = false;
        tokenHolded = true;
      }
    }
  });

  if (clickCanvas) {
    map.movementController(e);
  }
});
canvas.addEventListener('mousemove', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.movementController(e);
});
canvas.addEventListener('mouseup', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.movementController(e);
});
canvas.addEventListener('mouseleave', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.movementController(e);
});
canvas.addEventListener('dblclick', (e)=>{
  tokens.slice().reverse().forEach((token) => {
    token.handleMenu(e);
  })
});

canvas.addEventListener('wheel', map.handleZoom);

document.addEventListener('click', (e) => {
  switch (e.target.id) {
    case 'TM_movement':
      let tokenID = e.target.parentElement.parentElement.getAttribute('token_target')
      let token = map.tokens.find((token) => token.id == tokenID);
      token.closeMenu();
      break;
    case 'TM_info':
      console.log("Mostrar info");
      break;
    case 'TM_image':
      console.log("Cambiar imagen");
      break;
  }
});


// Funcionamiento del toolbar
toolbarMenu.forEach((option) => {
  option.addEventListener('click', (e) => {
    let slctdOpt = option.getAttribute('menu_option');

    toolbarMenu.forEach((li) => li.classList.remove('active'));
    option.classList.add('active');

    Object.keys(map.toolbar).map((key) => {
      if (key == slctdOpt) {
        map.toolbar[key] = true;
      }else{
        map.toolbar[key] = false;
      }
    });
  });
});


// Inicializacion del motor.
engine.start();



// Funciones
function render(){
  console.log("Render");
}

function update(){
  map.update();
}
