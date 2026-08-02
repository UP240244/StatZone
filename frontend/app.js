const API = 'http://localhost:3000/api';

/* Se pone en true solo si el backend responde. Mientras sea false,
   la pagina funciona con los datos de abajo (modo demo). */
let hayBackend = false;

let equipos = [];
let jugadores = [];
let editandoEquipo = null;
let editandoJugador = null;

    /*datos de muestra*/
const DEMO_EQUIPOS = [
  {_id:'e1', nombre:'Halcones Norte',    ciudad:'Aguascalientes', pj:7,g:6,e:1,p:0,gf:18,dif:14, pts:19},
  {_id:'e2', nombre:'Deportivo Centro',  ciudad:'Jesus Maria',    pj:7,g:5,e:1,p:1,gf:15,dif:9,  pts:16},
  {_id:'e3', nombre:'Atletico Poniente', ciudad:'Aguascalientes', pj:7,g:4,e:2,p:1,gf:12,dif:5,  pts:14},
  {_id:'e4', nombre:'Real Sur',          ciudad:'Calvillo',       pj:7,g:2,e:2,p:3,gf:9, dif:-3, pts:8},
  {_id:'e5', nombre:'Union Lagos',       ciudad:'Rincon',         pj:7,g:1,e:1,p:5,gf:5, dif:-11,pts:4},
  {_id:'e6', nombre:'Cuervos FC',        ciudad:'Pabellon',       pj:7,g:1,e:1,p:5,gf:5, dif:-14,pts:4}
];
const DEMO_JUGADORES = [
  {_id:'j1', nombre:'Mario Castaneda', equipoId:'e1', pos:'DEL', goles:9},
  {_id:'j2', nombre:'Julio Renteria',  equipoId:'e2', pos:'DEL', goles:7},
  {_id:'j3', nombre:'Ana Palomino',    equipoId:'e3', pos:'MED', goles:6},
  {_id:'j4', nombre:'Luis Hernandez',  equipoId:'e4', pos:'DEL', goles:5},
  {_id:'j5', nombre:'Sergio Vargas',   equipoId:'e5', pos:'DEL', goles:4}
];

/* 1. CARGA DE DATOS*/
async function cargar(){
  try {
    const r1 = await fetch(API + '/tabla');
    const r2 = await fetch(API + '/jugadores');
    if (!r1.ok || !r2.ok) throw new Error('respuesta invalida');
    equipos   = await r1.json();
    jugadores = await r2.json();
    hayBackend = true;
  } catch (error) {
    hayBackend = false;
    if (equipos.length === 0)   equipos   = DEMO_EQUIPOS;
    if (jugadores.length === 0) jugadores = DEMO_JUGADORES;
  }
  pintar();
}

function nombreEquipo(id){
  for (let i = 0; i < equipos.length; i++) {
    if (equipos[i]._id === id) return equipos[i].nombre;
  }
  return '';
}

function idPorNombre(nombre){
  for (let i = 0; i < equipos.length; i++) {
    if (equipos[i].nombre === nombre) return equipos[i]._id;
  }
  return '';
}

/* 2. PINTAR LA PANTALLA*/
function pintar(){
  if (!hayBackend) ordenarLocal();

  /* tabla de posiciones */
  let filas = '';
  for (let i = 0; i < equipos.length; i++) {
    const t = equipos[i];
    const signo = t.dif > 0 ? '+' : '';
    let clase = '';
    if (t.dif > 0) clase = 'up';
    if (t.dif < 0) clase = 'down';

    filas += '<tr class="' + (i === 0 ? 'lead' : '') + '">' +
      '<td class="l"><span class="pos">' + (i + 1) + '</span>' +
      '<button class="link" onclick="editarEquipo(\'' + t._id + '\')">' + t.nombre + '</button></td>' +
      '<td class="opt">' + t.pj + '</td><td class="opt">' + t.g + '</td>' +
      '<td class="opt">' + t.e + '</td><td class="opt">' + t.p + '</td>' +
      '<td class="' + clase + '">' + signo + t.dif + '</td>' +
      '<td class="pts">' + t.pts + '</td>' +
      '<td><button class="del" title="Eliminar" onclick="borrarEquipo(\'' + t._id + '\')">&times;</button></td>' +
      '</tr>';
  }
  document.getElementById('rows').innerHTML = filas;

  pintarJugadores(jugadores);

  /* llenar los select con id como value */
  let ops = '';
  for (let i = 0; i < equipos.length; i++) {
    ops += '<option value="' + equipos[i]._id + '">' + equipos[i].nombre + '</option>';
  }
  document.getElementById('loc').innerHTML = ops;
  document.getElementById('vis').innerHTML = ops;
  document.getElementById('jgEquipo').innerHTML = ops;

  /* aviso de estado */
  const pie = hayBackend
    ? 'Conectado a <code>' + API + '</code>'
    : 'Modo demo: los datos viven en memoria y se pierden al recargar.';
  document.getElementById('pie').innerHTML = pie;
}

function pintarJugadores(lista){
  let html = '';
  if (lista.length === 0) {
    html = '<p class="vacio">Sin resultados.</p>';
  }
  for (let i = 0; i < lista.length; i++) {
    const s = lista[i];
    /* el backend ya manda "equipo" resuelto por el $lookup;
       en modo demo lo resolvemos aqui con equipoId */
    const club = s.equipo ? s.equipo : nombreEquipo(s.equipoId);
    html += '<div class="row"><div class="n">' + s.nombre +
      '<small>' + club + ' &middot; ' + s.pos + '</small></div>' +
      '<span class="v">' + s.goles + '</span>' +
      '<button class="edit" title="Editar" onclick="editarJugador(\'' + s._id + '\')">&#9998;</button>' +
      '<button class="del" title="Eliminar" onclick="borrarJugador(\'' + s._id + '\')">&times;</button>' +
      '</div>';
  }
  document.getElementById('scorers').innerHTML = html;
}

function ordenarLocal(){
  equipos.sort(function(a, b){
    if (b.pts !== a.pts) return b.pts - a.pts;
    return b.dif - a.dif;
  });
  jugadores.sort(function(a, b){ return b.goles - a.goles; });
}

/* 3. MODALES*/
function abrir(id){  document.getElementById(id).classList.add('abierto'); }
function cerrar(id){ document.getElementById(id).classList.remove('abierto'); }

document.getElementById('cancelEquipo').onclick  = function(){ cerrar('fondoEquipo'); };
document.getElementById('cancelJugador').onclick = function(){ cerrar('fondoJugador'); };

/* 4. EQUIPOS - alta, cambio, baja*/
document.getElementById('btnEquipo').onclick = function(){
  editandoEquipo = null;
  document.getElementById('tituloEquipo').textContent = 'Nuevo equipo';
  document.getElementById('eqNombre').value = '';
  document.getElementById('eqCiudad').value = '';
  abrir('fondoEquipo');
};

function editarEquipo(id){
  for (let i = 0; i < equipos.length; i++) {
    if (equipos[i]._id === id) {
      editandoEquipo = id;
      document.getElementById('tituloEquipo').textContent = 'Editar equipo';
      document.getElementById('eqNombre').value = equipos[i].nombre;
      document.getElementById('eqCiudad').value = equipos[i].ciudad || '';
      abrir('fondoEquipo');
    }
  }
}

document.getElementById('guardaEquipo').onclick = async function(){
  const nombre = document.getElementById('eqNombre').value.trim();
  const ciudad = document.getElementById('eqCiudad').value.trim();
  if (nombre === '') { alert('Escribe el nombre del equipo'); return; }

  const datos = { nombre: nombre, ciudad: ciudad };

  if (editandoEquipo === null) {
    /* ALTA */
    if (hayBackend) {
      await enviar('POST', '/equipos', datos);
    } else {
      equipos.push({_id:'x' + Date.now(), nombre:nombre, ciudad:ciudad,
                    pj:0, g:0, e:0, p:0, gf:0, dif:0, pts:0});
    }
  } else {
    /* CAMBIO */
    if (hayBackend) {
      await enviar('PUT', '/equipos/' + editandoEquipo, datos);
    } else {
      for (let i = 0; i < equipos.length; i++) {
        if (equipos[i]._id === editandoEquipo) {
          equipos[i].nombre = nombre;
          equipos[i].ciudad = ciudad;
        }
      }
    }
  }
  cerrar('fondoEquipo');
  cargar();
};

async function borrarEquipo(id){
  if (!confirm('Eliminar este equipo?')) return;
  if (hayBackend) {
    await enviar('DELETE', '/equipos/' + id);
  } else {
    equipos = quitar(equipos, id);
  }
  cargar();
}

/* 5. JUGADORES - alta, cambio, baja*/
document.getElementById('btnJugador').onclick = function(){
  editandoJugador = null;
  document.getElementById('tituloJugador').textContent = 'Nuevo jugador';
  document.getElementById('jgNombre').value = '';
  document.getElementById('jgGoles').value = 0;
  abrir('fondoJugador');
};

function editarJugador(id){
  let jugador = null;
  for (let i = 0; i < jugadores.length; i++) {
    if (jugadores[i]._id === id) jugador = jugadores[i];
  }
  if (jugador === null) return;

  editandoJugador = id;
  document.getElementById('tituloJugador').textContent = 'Editar jugador';
  document.getElementById('jgNombre').value = jugador.nombre;
  document.getElementById('jgPos').value = jugador.pos;
  document.getElementById('jgGoles').value = jugador.goles;

  /* el goleo devuelve el nombre del equipo, no siempre el id */
  const idEquipo = jugador.equipoId ? jugador.equipoId : idPorNombre(jugador.equipo);
  if (idEquipo) document.getElementById('jgEquipo').value = idEquipo;

  abrir('fondoJugador');
}

document.getElementById('guardaJugador').onclick = async function(){
  const nombre = document.getElementById('jgNombre').value.trim();
  if (nombre === '') { alert('Escribe el nombre del jugador'); return; }

  const datos = {
    nombre:   nombre,
    equipoId: document.getElementById('jgEquipo').value,
    pos:      document.getElementById('jgPos').value,
    goles:    Number(document.getElementById('jgGoles').value)
  };

  if (hayBackend) {
    let r;
    if (editandoJugador === null) {
      r = await enviar('POST', '/jugadores', datos);
    } else {
      r = await enviar('PUT', '/jugadores/' + editandoJugador, datos);
    }
    /* si el backend rechazo los goles, el modal se queda abierto */
    if (!r.ok) return;
  } else {
    if (editandoJugador === null) {
      datos._id = 'x' + Date.now();
      jugadores.push(datos);
    } else {
      for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i]._id === editandoJugador) {
          jugadores[i].nombre   = datos.nombre;
          jugadores[i].equipoId = datos.equipoId;
          jugadores[i].pos      = datos.pos;
          jugadores[i].goles    = datos.goles;
        }
      }
    }
  }
  cerrar('fondoJugador');
  cargar();
};

async function borrarJugador(id){
  if (!confirm('Eliminar este jugador?')) return;
  if (hayBackend) {
    await enviar('DELETE', '/jugadores/' + id);
  } else {
    jugadores = quitar(jugadores, id);
  }
  cargar();
}

/* 6. PARTIDOS*/
document.getElementById('btnPartido').onclick = async function(){
  const localId = document.getElementById('loc').value;
  const visitId = document.getElementById('vis').value;
  const gl = Number(document.getElementById('gl').value);
  const gv = Number(document.getElementById('gv').value);

  if (localId === visitId) { alert('Un equipo no puede jugar contra si mismo'); return; }

  if (hayBackend) {
    await enviar('POST', '/partidos', {
      localId: localId, visitanteId: visitId,
      golesLocal: gl, golesVisitante: gv,
      fecha: new Date().toISOString()
    });
  } else {
    for (let i = 0; i < equipos.length; i++) {
      if (equipos[i]._id === localId) sumar(equipos[i], gl, gv);
      if (equipos[i]._id === visitId) sumar(equipos[i], gv, gl);
    }
  }
  document.getElementById('gl').value = 0;
  document.getElementById('gv').value = 0;
  cargar();
};

function sumar(t, favor, contra){
  t.pj  = t.pj + 1;
  t.gf  = t.gf + favor;
  t.dif = t.dif + (favor - contra);
  if (favor > contra)       { t.g = t.g + 1; t.pts = t.pts + 3; }
  else if (favor === contra){ t.e = t.e + 1; t.pts = t.pts + 1; }
  else                      { t.p = t.p + 1; }
}

/* 7. FIN DE TEMPORADA*/
document.getElementById('btnFinTemporada').onclick = async function(){
  if (!hayBackend) {
    alert('Se necesita conexion con el servidor para cerrar la temporada');
    return;
  }

  const aceptar = confirm(
    'Se eliminaran todos los partidos y los goles de los jugadores volveran ' +
    'a cero. Los equipos se conservan. Continuar?'
  );
  if (!aceptar) return;

  const r = await enviar('POST', '/temporada/fin');
  if (!r.ok) return;

  mostrarCampeon(await r.json());
  cargar();
};

function mostrarCampeon(datos){
  const c = datos.campeon;
  let html = '<h3>Fin de temporada</h3>';
  html += '<p><strong>' + c.nombre + '</strong> se corona campeon con ' + c.pts + ' puntos.</p>';
  html += '<p>' + c.g + ' ganados, ' + c.e + ' empatados, ' + c.p +
          ' perdidos &middot; diferencia ' + (c.dif > 0 ? '+' : '') + c.dif + '</p>';

  if (datos.subcampeon) {
    html += '<p>Subcampeon: ' + datos.subcampeon.nombre + ' con ' +
            datos.subcampeon.pts + ' puntos.</p>';
  }
  if (datos.goleador) {
    html += '<p>Maximo goleador: ' + datos.goleador.nombre + ' (' +
            datos.goleador.equipo + ') con ' + datos.goleador.goles + ' goles.</p>';
  }
  html += '<button class="cerrar" onclick="cerrarAviso()">Cerrar</button>';

  const aviso = document.getElementById('aviso');
  aviso.innerHTML = html;
  aviso.classList.add('visible');
  window.scrollTo(0, 0);
}

function cerrarAviso(){
  document.getElementById('aviso').classList.remove('visible');
}

/* 8. BUSCADOR - indice de texto de MongoDB*/
let temporizador = null;

document.getElementById('buscar').oninput = function(evento){
  const texto = evento.target.value.trim();

  /* esperamos 300 ms para no pegarle al servidor en cada tecla */
  clearTimeout(temporizador);
  temporizador = setTimeout(async function(){

    if (texto === '') { pintarJugadores(jugadores); return; }

    if (hayBackend) {
      const r = await fetch(API + '/jugadores/buscar?q=' + encodeURIComponent(texto));
      pintarJugadores(await r.json());
    } else {
      const filtrados = [];
      for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i].nombre.toLowerCase().indexOf(texto.toLowerCase()) !== -1) {
          filtrados.push(jugadores[i]);
        }
      }
      pintarJugadores(filtrados);
    }
  }, 300);
};

/* 9. AYUDAS*/
async function enviar(metodo, ruta, cuerpo){
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (cuerpo) opciones.body = JSON.stringify(cuerpo);

  const r = await fetch(API + ruta, opciones);
  if (!r.ok) {
    /* clone() para no consumir el cuerpo: quien llamo puede volver a leerlo */
    const e = await r.clone().json();
    let mensaje = e.message ? e.message : e.error;
    if (Array.isArray(mensaje)) mensaje = mensaje.join('\n');
    alert(mensaje ? mensaje : 'Error ' + r.status);
  }
  return r;
}

function quitar(lista, id){
  const nuevos = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i]._id !== id) nuevos.push(lista[i]);
  }
  return nuevos;
}

cargar();