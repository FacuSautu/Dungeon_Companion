// Constantes para obtener elementos del DOM.
const canvas = document.getElementById('canvas');
const chatLog = document.getElementById('messages');
const chatBtn = document.getElementById('chatBtn');
const chatBox = document.getElementById('chatInput');

// Instanciación de objetos.
const PJ = new HojaPJ(garret);
const token = new Token(20, 20, 20, PJ);
const map = new Map(canvas, 750, 750);
map.renderGrid();
map.addToken(token);
map.update();

const chat = new Chat(chatLog);

// Definición de Event Listeners.
chatBtn.addEventListener('click', (event) =>{
  if (chat.sendMessage(chatBox.value)) {
    chatBox.value = '';
  }
});
chatBox.addEventListener('keypress', (e) =>{
  if(e.keyCode == 13) {
    if (chat.sendMessage(chatBox.value)) {
      chatBox.value='';
    }
  }
})

canvas.addEventListener('click', (e)=>{
  if (!map.showTokenMovement(e)) {
    token.movementController(e);
  }
  map.update();
})
