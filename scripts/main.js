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
  switch (map.activeLayerName) {
    case 'objects&tokens':
      let clickCanvas = true;
      let tokenHolded = false;
      map.tokens.slice().reverse().forEach(token => {
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
      break;

    case 'map&background':
      map.images.slice().reverse().forEach(mapImg => {
        mapImg.handleMouseDown(e);
      });
      break;
  }
});
canvas.addEventListener('mousemove', (e)=>{
  switch (map.activeLayerName) {
    case 'objects&tokens':
      map.tokens.forEach((token) => {
        token.handleMovement(e);
      });
      map.handleMouseMove(e);
      break;

    case 'map&background':
      map.images.forEach((mapImg) => {
        mapImg.handleMouseMove(e);
      });
      break;
  }
});
canvas.addEventListener('mouseup', (e)=>{
  switch (map.activeLayerName) {
    case 'objects&tokens':
      map.tokens.forEach((token) => {
        token.handleMovement(e);
      });
      map.handleMouseUp(e);
      break;

    case 'map&background':
      map.images.forEach((mapImg) => {
        mapImg.handleMouseUp(e);
      });
      break;
  }
});
canvas.addEventListener('mouseleave', (e)=>{
  switch (map.activeLayerName) {
    case 'objects&tokens':
      map.tokens.forEach((token) => {
        token.handleMovement(e);
      });
      map.handleMouseLeave(e);
      break;

    case 'map&background':
      map.images.forEach((mapImg) => {
        mapImg.handleMouseLeave(e);
      });
      break;
  }
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

  const mapImg = new mapImage(image, 300, 300);
  map.addImage(mapImg);
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
              switch (compendiumItem[1]) {
                case 'razas':
                  fetch('assets/layout/compendium/race_detail/index.html')
                    .then(res => res.text())
                    .then((html)=>{
                      let raceDetail = document.createElement('div');
                      raceDetail.innerHTML = html;

                      // Nombre de Raza
                      raceDetail.querySelector('#race_name').innerText = `${compData.name}`;

                      // Bonificacion de atributos
                      compData.ability_bonuses.forEach(ability_bonus => {
                        raceDetail.querySelector(`#race_attr_bonus_${ability_bonus.ability_score.index}`).innerText = (ability_bonus.bonus > 0) ? `+${ability_bonus.bonus}` : ability_bonus.bonus;
                      });

                      // Rasgos de Raza
                      raceDetail.querySelector('#race_traits').innerText = '';
                      compData.traits.forEach(async trait => {
                        await fetch(`https://www.dnd5eapi.co${trait.url}`)
                          .then(res => res.json())
                          .then(traitData => {
                            raceDetail.querySelector('#race_traits').innerHTML += `<div class="property-block">
                                                                                    <h4>${traitData.name}.</h4>
                                                                                    <p>${traitData.desc.join('\n')}</p>
                                                                                  </div>`;
                          });
                      });

                      // Detalle de Raza
                      raceDetail.querySelector('#race_alignement').innerHTML = `<h3>Alignment</h3>
                                                                                <div class="property-block">
                                                                                  <p>${compData.alignment}</p>
                                                                                </div>`;
                      raceDetail.querySelector('#race_size').innerHTML = `<h3>Size [${compData.size}]</h3>
                                                                          <div class="property-block">
                                                                            <p>${compData.size_description}</p>
                                                                          </div>`;
                      raceDetail.querySelector('#race_speed').innerHTML = `<h3>Speed: ${compData.speed}fts</h3>`;
                      raceDetail.querySelector('#race_laguages').innerHTML = `<h3>Languages</h3>
                                                                              <div class="property-block">
                                                                                <p>${compData.language_desc}</p>
                                                                              </div>
                                                                              <div class="abilities" id="race_languages_known">
                                                                                <hr>
                                                                                <h4>Known</h4>
                                                                                <hr>
                                                                              </div>`;
                      compData.languages.forEach(language => {
                        raceDetail.querySelector('#race_languages_known').innerHTML += `<div class="ability-strength">
                                                                                          <h4>${language.name}</h4>
                                                                                        </div>`;
                      });
                      if (compData.language_options) {
                        raceDetail.querySelector('#race_laguages').innerHTML += `<div class="abilities" id="race_languages_option">
                                                                                  <hr>
                                                                                  <h4>Choose ${compData.language_options.choose} from:</h4>
                                                                                  <hr>
                                                                                </div>`;
                        compData.language_options.from.options.forEach(lang_option => {
                          raceDetail.querySelector('#race_languages_option').innerHTML += `<div class="ability-strength">
                                                                                            <h4>${lang_option.item.name}</h4>
                                                                                          </div>`;
                        });
                      }


                      Swal.fire({
                        html: raceDetail.innerHTML,
                        width: "80%",
                      });
                    });
                  break;

                case 'clases':
                  fetch('assets/layout/compendium/class_detail/index.html')
                    .then(res => res.text())
                    .then((html)=>{
                      let classDetail = document.createElement('div');
                      classDetail.innerHTML = html;

                      // Class Name
                      classDetail.querySelector('#class_name').innerText = compData.name;

                      // Class Hit Dice-Points
                      classDetail.querySelector('#class_hit_dice').innerText = `1D${compData.hit_die} per level`;
                      classDetail.querySelector('#class_hit_points_1').innerText = `${compData.hit_die} + CON`;
                      classDetail.querySelector('#class_hit_points').innerText = `1D${compData.hit_die} (or ${compData.hit_die/2}) + CON per level after the 1st`;

                      // Class Saving Throws
                      classDetail.querySelector('#class_saving_throws').innerHTML = `<h3>Saving Throws</h3>
                                                                                    <div class="property-block">
                                                                                      <div class="abilities" id="class_saving_throws_values">
                                                                                      </div>
                                                                                    </div>`;
                      compData.saving_throws.forEach(saving_throw => {
                        classDetail.querySelector('#class_saving_throws_values').innerHTML += `<div class="ability-strength">
                                                                                                <h4>${saving_throw.name}</h4>
                                                                                              </div>`;
                      });

                      // Class Proficiencies
                      classDetail.querySelector('#class_proficiencies').innerHTML = `<h3>Proficiencies</h3>
                                                                                    <div class="property-block">
                                                                                      <div class="abilities" id="class_proficiencies_known">
                                                                                      </div>
                                                                                      <div class="abilities" id="class_proficiencies_option">
                                                                                      </div>
                                                                                    </div>`;
                      compData.proficiencies.forEach(proficiency => {
                        classDetail.querySelector('#class_proficiencies_known').innerHTML += `<div class="ability-strength">
                                                                                                <h4>${proficiency.name}</h4>
                                                                                              </div>`;
                      });
                      compData.proficiency_choices.forEach(proficiency_opt => {
                        classDetail.querySelector('#class_proficiencies_option').innerHTML += `<hr>
                                                                                               <h4>Choose ${proficiency_opt.choose} from:</h4>
                                                                                               <br>`;
                        proficiency_opt.from.options.forEach(option => {
                          classDetail.querySelector('#class_proficiencies_option').innerHTML += `<div class="ability-strength">
                                                                                                  <h4>${option.item.name}</h4>
                                                                                                </div>`;
                        });
                      });

                      // Class Equipment
                      classDetail.querySelector('#class_equipment').innerHTML = `<h3>Equipment</h3>
                                                                                <div class="property-block" id="class_equipment_items">
                                                                                </div>`;
                      compData.starting_equipment.forEach(equipment => {
                        classDetail.querySelector('#class_equipment_items').innerHTML += `<div class="ability-strength">
                                                                                            <h4>${equipment.quantity} x ${equipment.equipment.name}</h4>
                                                                                          </div>`;
                      });
                      compData.starting_equipment_options.forEach(equipment_opt => {
                        classDetail.querySelector('#class_equipment_items').innerHTML += `<div class="ability-strength">
                                                                                            <h4>${equipment_opt.choose} x ${equipment_opt.desc}</h4>
                                                                                          </div>`;
                      });

                      Swal.fire({
                        html: classDetail.innerHTML,
                        width: "80%",
                      });
                    });
                  break;

                case 'bestiario':
                  fetch('assets/layout/compendium/monster_statblock/two-column.html')
                    .then(res => res.text())
                    .then((html)=>{
                      let statBlock = document.createElement('div');
                      statBlock.innerHTML = html;

                      // Informacion general del Mounstruo
                      statBlock.querySelector('#monster_name').innerText = compData.name;
                      statBlock.querySelector('#size_type_alignment').innerText = `${compData.size} ${compData.type}, ${compData.alignment}`;
                      statBlock.querySelector('#monster_AC').innerText = `${compData.armor_class}`;
                      statBlock.querySelector('#monster_hitpoints').innerText = `${compData.hit_points} (${compData.hit_dice} + ${Number(compData.hit_dice.split('d')[0])*Math.floor((compData.constitution-10)/2)})`;
                      statBlock.querySelector('#monster_speed').innerText = ``;
                      Object.keys(compData.speed).forEach((speed) => {
                        if(speed == 'walk') {
                          statBlock.querySelector('#monster_speed').innerText += `${compData.speed[speed]}`;
                        }else {
                          statBlock.querySelector('#monster_speed').innerText += ` ${speed}: ${compData.speed[speed]}`;
                        }
                      });

                      // Atributos y Modificadores
                      statBlock.querySelector('#monster_attr_str').innerText = `${compData.strength} (${((compData.strength-10)/2)>0 ? '+'+Math.floor((compData.strength-10)/2) : Math.floor((compData.strength-10)/2)})`;
                      statBlock.querySelector('#monster_attr_dex').innerText = `${compData.dexterity} (${((compData.dexterity-10)/2)>0 ? '+'+Math.floor((compData.dexterity-10)/2) : Math.floor((compData.dexterity-10)/2)})`;
                      statBlock.querySelector('#monster_attr_con').innerText = `${compData.constitution} (${((compData.constitution-10)/2)>0 ? '+'+Math.floor((compData.constitution-10)/2) : Math.floor((compData.constitution-10)/2)})`;
                      statBlock.querySelector('#monster_attr_int').innerText = `${compData.intelligence} (${((compData.intelligence-10)/2)>0 ? '+'+Math.floor((compData.intelligence-10)/2) : Math.floor((compData.intelligence-10)/2)})`;
                      statBlock.querySelector('#monster_attr_wis').innerText = `${compData.wisdom} (${((compData.wisdom-10)/2)>0 ? '+'+Math.floor((compData.wisdom-10)/2) : Math.floor((compData.wisdom-10)/2)})`;
                      statBlock.querySelector('#monster_attr_cha').innerText = `${compData.charisma} (${((compData.charisma-10)/2)>0 ? '+'+Math.floor((compData.charisma-10)/2) : Math.floor((compData.charisma-10)/2)})`;

                      // Resistencias y Sentidos
                      statBlock.querySelector('#monster_properties').innerText = '';
                      if(compData.damage_resistances.length > 0){
                        statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                      <h4>Damage Resistance:</h4>
                                                                                      <p id="monster_dmg_resistances"></p>
                                                                                    </div>`;
                        compData.damage_resistances.forEach(dmg_res => {
                          if (statBlock.querySelector('#monster_dmg_resistances').innerText == '') {
                            statBlock.querySelector('#monster_dmg_resistances').innerText = `${dmg_res}`;
                          }else {
                            statBlock.querySelector('#monster_dmg_resistances').innerText += `, ${dmg_res}`;
                          }
                        });
                      }
                      if(compData.damage_immunities.length > 0){
                        statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                      <h4>Damage Immunities:</h4>
                                                                                      <p id="monster_dmg_inmunities"></p>
                                                                                    </div>`;
                        compData.damage_immunities.forEach(dmg_inm => {
                          if (statBlock.querySelector('#monster_dmg_inmunities').innerText == '') {
                            statBlock.querySelector('#monster_dmg_inmunities').innerText = `${dmg_inm}`;
                          }else {
                            statBlock.querySelector('#monster_dmg_inmunities').innerText += `, ${dmg_inm}`;
                          }
                        });
                      }
                      if(compData.damage_vulnerabilities.length > 0){
                        statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                      <h4>Damage Vulnerabilities:</h4>
                                                                                      <p id="monster_dmg_vulnerabilities"></p>
                                                                                    </div>`;
                        compData.damage_vulnerabilities.forEach(dmg_vul => {
                          if (statBlock.querySelector('#monster_dmg_vulnerabilities').innerText == '') {
                            statBlock.querySelector('#monster_dmg_vulnerabilities').innerText = `${dmg_vul}`;
                          }else {
                            statBlock.querySelector('#monster_dmg_vulnerabilities').innerText += `, ${dmg_vul}`;
                          }
                        });
                      }
                      if(compData.condition_immunities.length > 0){
                        statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                      <h4>Condition Inmunities:</h4>
                                                                                      <p id="monster_cond_inmunities"></p>
                                                                                    </div>`;
                        compData.condition_immunities.forEach(cond_inm => {
                          if (statBlock.querySelector('#monster_cond_inmunities').innerText == '') {
                            statBlock.querySelector('#monster_cond_inmunities').innerText = `${cond_inm.name}`;
                          }else {
                            statBlock.querySelector('#monster_cond_inmunities').innerText += `, ${cond_inm.name}`;
                          }
                        });
                      }
                      if(Object.keys(compData.senses).length > 0){
                        statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                      <h4>Senses:</h4>
                                                                                      <p id="monster_senses"></p>
                                                                                    </div>`;
                        Object.keys(compData.senses).forEach(sense => {
                          if (statBlock.querySelector('#monster_senses').innerText == '') {
                            statBlock.querySelector('#monster_senses').innerText = `${sense} ${compData.senses[sense]}`;
                          }else {
                            statBlock.querySelector('#monster_senses').innerText += `, ${sense} ${compData.senses[sense]}`;
                          }
                        });
                      }
                      statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                    <h4>Languages:</h4>
                                                                                    <p id="monster_languages"></p>
                                                                                  </div>`;
                      statBlock.querySelector('#monster_languages').innerHTML = (compData.languages == '') ? '&mdash;' : compData.languages;
                      statBlock.querySelector('#monster_properties').innerHTML += `<div class="property-line first">
                                                                                    <h4>Challenge:</h4>
                                                                                    <p id="monster_CR">${compData.challenge_rating} (${compData.xp} XP)</p>
                                                                                  </div>`;

                      // Habilidades
                      statBlock.querySelector('#monster_habilities').innerText = '';
                      if(compData.special_abilities.length > 0){
                        compData.special_abilities.forEach(special_ability => {
                          statBlock.querySelector('#monster_habilities').innerHTML += `<div class="property-block">
                                                                                         <h4>${special_ability.name}:</h4>
                                                                                         <p>${special_ability.desc}</p>
                                                                                       </div>`;
                        });
                      }

                      // Acciones
                      statBlock.querySelector('#monster_actions').innerText = '';
                      if (compData.actions.length > 0) {
                        statBlock.querySelector('#monster_actions').innerHTML = `<h3>Actions</h3>`;
                        compData.actions.forEach(action => {
                          statBlock.querySelector('#monster_actions').innerHTML += `<div class="property-block">
                                                                                      <h4>${action.name}.</h4>
                                                                                      <p>${action.desc}</p>
                                                                                    </div>`;
                        });
                      }

                      // Acciones Legendarias
                      statBlock.querySelector('#monster_legendary_actions').innerText = '';
                      if (compData.legendary_actions.length > 0) {
                        statBlock.querySelector('#monster_legendary_actions').innerHTML = `<h3>Legendary Actions</h3>`;
                        compData.legendary_actions.forEach(legendary_action => {
                          statBlock.querySelector('#monster_legendary_actions').innerHTML += `<div class="property-block">
                                                                                      <h4>${legendary_action.name}.</h4>
                                                                                      <p>${legendary_action.desc}</p>
                                                                                    </div>`;
                        });
                      }

                      Swal.fire({
                        html: statBlock.innerHTML,
                        width: "80%",
                      });
                    });
                  break;

                case 'conjuros':
                  fetch('assets/layout/compendium/spell_detail/index.html')
                    .then(res => res.text())
                    .then((html)=>{
                      let spellDetail = document.createElement('div');
                      spellDetail.innerHTML = html;

                      // Encabezado de conjuro
                      spellDetail.querySelector('#spell_name').innerText = `${compData.name}`;
                      spellDetail.querySelector('#spell_lvl_school').innerText = `Level ${compData.level}, ${compData.school.name.toLowerCase()} ${(compData.ritual) ? '(ritual)' : ''}`;

                      // Parametros del conjuro
                      spellDetail.querySelector('#spell_casting_time').innerText = `${compData.casting_time}`;
                      spellDetail.querySelector('#spell_range').innerText = `${compData.range}`;
                      spellDetail.querySelector('#spell_components').innerText = `${compData.components.join(', ')} ${(compData.material == '') ? '('+compData.material+')' : ''}`;
                      spellDetail.querySelector('#spell_duration').innerText = `${(compData.concentration) ? 'Concentration,' : ''} ${compData.duration}`;

                      // Descripcion del conjuro
                      spellDetail.querySelector('#spell_description').innerText = '';
                      compData.desc.forEach(spellDesc => {
                        spellDetail.querySelector('#spell_description').innerHTML += `<div class="property-line">
                                                                                        <p>${spellDesc}</p>
                                                                                      </div>`;
                      });
                      if (compData.higher_level.length > 0) {
                        compData.higher_level.forEach(spellHL => {
                          spellDetail.querySelector('#spell_description').innerHTML += `<div class="property-line">
                                                                                          <h4>At Higher Levels:</h4>
                                                                                          <p>${spellHL}</p>
                                                                                        </div>`;
                        });
                      }

                      // Clases que utilizan el conjuro
                      spellDetail.querySelector('#spell_clases').innerText = '';
                      compData.classes.forEach(spellClass =>{
                        spellDetail.querySelector('#spell_clases').innerHTML += `<div class="property-line first">
                                                                                  <p>${spellClass.name}</p>
                                                                                </div>`;
                      });

                      Swal.fire({
                        html: spellDetail.innerHTML,
                        width: "80%",
                      });
                    });
                  break;
              }
            })
        });

        compList.append(comp_li);

      });
    })
    .catch(error => alert("Error de API:\n"+error));
  });
}
