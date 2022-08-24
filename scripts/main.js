// Constantes para obtener elementos del DOM.
const canvas = document.getElementById('canvas');
const chatLog = document.getElementById('messages');
const chatBtn = document.getElementById('chatBtn');
const chatBox = document.getElementById('chatInput');
const toolbarMenu = document.querySelectorAll('.toolbar_menu_option');
const toolbarSubmenu = document.querySelectorAll('.toolbar_submenu_option');

// Instanciación de objetos.
const PJs = [new HojaPJ(garret), new HojaPJ(leosariph)];
const tokens = [
  new Token(0, 20, 20, 30, PJs[0], 'assets/img/tokens/Garret_token.jpg'),
  new Token(1, 100, 100, 30, PJs[1], 'assets/img/tokens/Leosariph_token.jpg')
];
const map = new DungeonMap(canvas, 2000, 2000, 60, tokens);
map.renderGrid();
map.update();

const engine = new Engine(1000/30, update, render);

const user = new User('Facu', true, tokens);
const chat = new Chat(user, chatLog);


// Carga de datos por API
loadCompendium();


// Definición de Event Listeners.

// Evento para enviar mensaje por chat clickeando el boton de "Send".
chatBtn.addEventListener('click', () =>{
  if (chat.sendMessage(chatBox.value)) {
    chatBox.value = '';
    chatBox.select();
  }
});
// Evento para enviar el mensaje por chat al dar Enter en el input de mensaje.
chatBox.addEventListener('keypress', (e) =>{
  if(e.keyCode == 13) {
    if (chat.sendMessage(chatBox.value)) {
      chatBox.value='';
    }
  }
});

// Eventos para manejar el movimiento de los token.
canvas.addEventListener('mousedown', (e)=>{
  let clickCanvas = true;
  let tokenHolded = false;
  tokens.slice().reverse().forEach((token) => {
    if(!tokenHolded && map.utilities.select.active){
      if(token.handleMovement(e)){
        clickCanvas = false;
        tokenHolded = true;
      }
    }
  });

  if (clickCanvas) {
    map.handleMouseDown(e);
  }
});
canvas.addEventListener('mousemove', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.handleMouseMove(e);
});
canvas.addEventListener('mouseup', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.handleMouseUp(e);
});
canvas.addEventListener('mouseleave', (e)=>{
  tokens.forEach((token) => {
    token.handleMovement(e);
  });
  map.handleMouseLeave(e);
});
canvas.addEventListener('dblclick', (e)=>{
  tokens.slice().reverse().forEach((token) => {
    token.handleMenu(e);
  })
});

// Evento para envitar el boton derecho en el canvas.
canvas.addEventListener('conhtmlmenu', e => e.preventDefault());

// Evento para el zoom en el canvas.
canvas.addEventListener('wheel', map.handleWheel);

// Eventos para poder dropear una imagen en el canvas y que aparezca.
canvas.addEventListener('dragover', (e) => {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});
canvas.addEventListener('drop', (e) => {
  e.stopPropagation();
  e.preventDefault();

  const reader = new FileReader();
  const image = new Image();
  const file = e.dataTransfer.files[0];

  reader.onload = (e) => {
    image.src = event.target.result;
  }
  reader.readAsDataURL(file);

  const mapImg = new mapImage(image, 800, 800);
  map.addImage(mapImg);
});

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
toolbarMenu.forEach((menuOption) => {
  menuOption.addEventListener('click', (e) => {
    const slctdMenuOpt = menuOption.getAttribute('menu_option');                // Variable con el indicador de la opcion elegida.
    const canBeActive = ['select', 'draw', 'measure', 'fog'];                   // Array de opciones que pueden estar marcadas como activas.

    // Seteo de elemento activo del menu.
    if (canBeActive.includes(slctdMenuOpt)) {
      toolbarMenu.forEach((li) => li.classList.remove('active'));
      menuOption.classList.add('active');
    }

    if (slctdMenuOpt == 'add_token') {
      fetch('assets/layout/dnd_5e_charSheet/index.html')
        .then(res => res.text())
        .then((html) => {
          Swal.fire({
            title: 'Cargar Token',
            html,
            width: "80%",
            confirmButtonText: 'Cargar',
            showCancelButton: true,
            preConfirm: () => {
              let tokenName = document.getElementById('tokenName');
              let tokenPJ = document.getElementById('tokenPJ');
              let tokenImg = document.getElementById('tokenImg');

              if(!tokenName.value || !tokenPJ.value || !tokenImg.value){
                return false;
              }
            },
          }).then((alertValue)=>{
            if(alertValue.value){
              let tokenName = document.getElementById('tokenName').value;
              let tokenPJ = (document.getElementById('tokenPJ').value == 1) ? new HojaPJ(garret) : new HojaPJ(leosariph);
              let tokenImg = document.getElementById('tokenImg').value;

              let newToken = new Token(2, 300, 300, map.gridSize/2, tokenPJ,tokenImg);

              map.addToken(newToken);
            }
          });
        });
    }else{
      // Cambio de valores en el objeto Map.
      map.setUtilityOpt('utility', slctdMenuOpt);
    }
  });
});

toolbarSubmenu.forEach((submenuOption) => {
  submenuOption.addEventListener('click', (e) => {
    const parentOption = submenuOption.parentElement.parentElement;                               // Nodo padre del submenu.
    const slctdMenuOpt = submenuOption.parentElement.parentElement.getAttribute('menu_option');   // Valor indicador de la opcion elegida en el menu.
    const menuIcon = parentOption.children[0];
    const slctdSubmenuOpt = submenuOption.getAttribute('submenu_option');                         // Valor indicador de la opcion elegida en el submenu.
    const submenuIcon = submenuOption.firstChild.cloneNode(true);

    switch (slctdMenuOpt) {
      case 'select':
      case 'draw':
        map.setUtilityOpt('utility_opt', slctdMenuOpt, slctdSubmenuOpt);
        parentOption.setAttribute('submenu_option', slctdSubmenuOpt);
        break;

      case 'layers':
        map.setActiveLayer(slctdSubmenuOpt);
        break;

      case 'zoom':
        const zoomValue = Number(submenuOption.getAttribute('value'))/100;
        map.zoom('x', zoomValue);
        break;
    }

    toolbarSubmenu.forEach((li) => li.classList.remove('active'));
    submenuOption.classList.add('active');
    if (submenuIcon.hasAttribute('can_be_selected')) {
      menuIcon.replaceWith(submenuIcon);
    }
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

async function loadCompendium(){
  const compendiumItems = [['races', 'razas'], ['classes', 'clases'], ['monsters', 'bestiario'], ['spells', 'conjuros']];

  compendiumItems.forEach(compendiumItem => {
    fetch(`https://www.dnd5eapi.co/api/${compendiumItem[0]}`)
    .then(res => res.json())
    .then(rules => {
      const compList = document.getElementById(`compendio-${compendiumItem[1]}-list`);
      rules.results.forEach((rule) => {
        const comp_li = document.createElement('li');
        comp_li.classList.add('list-group-item');
        comp_li.setAttribute('api_url', rule.url);
        comp_li.innerText = "- "+rule.name;

        comp_li.addEventListener('click', () => {
          const liTitle = comp_li.innerText;
          fetch(`https://www.dnd5eapi.co${comp_li.getAttribute('api_url')}`)
            .then(res => res.json())
            .then(compData => {
              console.log(compData);
              let compInfo;
              switch (compendiumItem[1]) {
                case 'razas':
                  compInfo = `<h3>${compData.name}</h3>
                  <hr>
                  <h4>Attribute bonus</h4>
                  <span id="atribute_bonus" style="display:flex; flex-wrap: wrap">`;

                  compData.ability_bonuses.forEach(ability_bonus => {
                    compInfo += `<span style="padding: 0 10px">${ability_bonus.ability_score.name} +${ability_bonus.bonus}</span>`;
                  })
                  compInfo += `</span>
                  <hr>
                  <h4>Alignment</h4>
                  <p>${compData.alignment}</p>
                  <hr>
                  <h4>Size [${compData.size}]</h4>
                  <p>${compData.size_description}</p>
                  <hr>
                  <h4>Speed: ${compData.speed}fts</h4>
                  <hr>
                  <h4>Languages</h4>
                  <p>${compData.language_desc}</p>`;
                  break;

                case 'clases':
                  compInfo = `<h3>Barbarian</h3>
                  <hr>
                  <h4>Hit Points</h4>
                  <p><b>Hit Dice: </b>1D${compData.hit_die} per level</p>
                  <p><b>Hit Points at 1st Level: </b>${compData.hit_die} + CONS</p>
                  <p><b>Hit Points at Higher Levels: </b>1D${compData.hit_die} (or ${compData.hit_die/2}) + CONS per level after the 1st</p>
                  <hr>
                  <h4>Proficiencies</h4>
                  <span style="display: flex; flex-wrap:wrap">`;
                  compData.proficiencies.forEach(proficiencie => compInfo += `<span style="padding: 0 10px">${proficiencie.name}</span>`);
                  compData.proficiency_choices.forEach(proficiencieChoice => compInfo += `<span style="width: 100%; padding: 10px 10px">${proficiencieChoice.desc}</span>`);
                  compInfo += `</span>
                  <hr>
                  <h4>Equipment</h4>
                  <span style="display: flex; flex-direction: column; flex-wrap:wrap">`;
                  compData.starting_equipment.forEach(startEquip => compInfo += `<span style="padding: 0 10px">${startEquip.quantity} X ${startEquip.equipment.name}</span>`);
                  compData.starting_equipment_options.forEach(startEquipOpt => compInfo += `<span style="padding: 0 10px">${startEquipOpt.desc}</span>`);
                  compInfo += `</span>`;
                  break;

                case 'bestiario':
                  compInfo = `<h3>${compData.name}</h3>
                  <p>${compData.size}${compData.type}, ${compData.alignment}</p>
                  <hr>
                  <p><b>Armor Class </b>${compData.armor_class}</p>
                  <p><b>Hit Points </b>${compData.hit_points}</p>
                  <p><b>Speed </b>
                    ${(compData.speed.walk) ? compData.speed.walk+'ft.' : ''}
                    ${(compData.speed.fly) ? 'fly: '+compData.speed.fly+'ft.' : ''}
                    ${(compData.speed.swim) ? 'swim: '+compData.speed.swim+'ft.' : ''}
                  </p>
                  <hr>
                  <span style="display: flex; justify-content: space-evenly;">
                    <span style="display: flex; flex-direction: column;">
                      STR
                      <p>${compData.strength} (${((compData.strength-10)/2 > 0) ? '+'+(compData.strength-10)/2 : (compData.strength-10)/2})</p>
                    </span>
                    <span style="display: flex; flex-direction: column;">
                      DEX
                      <p>${compData.dexterity} (${((compData.dexterity-10)/2 > 0) ? '+'+(compData.dexterity-10)/2 : (compData.dexterity-10)/2})</p>
                    </span>
                    <span style="display: flex; flex-direction: column;">
                      CON
                      <p>${compData.constitution} (${((compData.constitution-10)/2 > 0) ? '+'+(compData.constitution-10)/2 : (compData.constitution-10)/2})</p>
                    </span>
                    <span style="display: flex; flex-direction: column;">
                      INT
                      <p>${compData.intelligence} (${((compData.intelligence-10)/2 > 0) ? '+'+(compData.intelligence-10)/2 : (compData.intelligence-10)/2})</p>
                    </span>
                    <span style="display: flex; flex-direction: column;">
                      WIS
                      <p>${compData.wisdom} (${((compData.wisdom-10)/2 > 0) ? '+'+(compData.wisdom-10)/2 : (compData.wisdom-10)/2})</p>
                    </span>
                    <span style="display: flex; flex-direction: column;">
                      CHA
                      <p>${compData.charisma} (${((compData.charisma-10)/2 > 0) ? '+'+(compData.charisma-10)/2 : (compData.charisma-10)/2})</p>
                    </span>
                  </span>
                  <hr>
                  <p><b>Saving Throws/Skills </b>`;
                  compData.proficiencies.forEach(prof=> compInfo += `${prof.proficiency.name}, `);
                  compInfo += `</p>
                  <p><b>Senses </b></p>
                  <p><b>Languages </b></p>
                  <p><b>Challenge </b></p>
                  <hr>
                  <p><b>Challenge </b></p>
                  <hr>
                  <h5>Actions</h5>
                  <p><b>Challenge </b></p>`;
                  break;

                case 'razaconjuros':
                  compInfo.innerHTML = ``;
                  break;
              }

              Swal.fire({
                title: liTitle,
                html: compInfo,
                width: "80%",
              });
            })
        });

        compList.append(comp_li);

      });
    })
    .catch(error => alert("Error de API:\n"+error));
  });
}
