/////////////////////////////////
//CLASES
/////////////////////////////////

class Bola {
    bola_x;
    bola_y;
    bola_vx;
    bola_vy;
    bola_radio;
    lanzada;
    estela;

    constructor(bola_x, bola_y, bola_vx, bola_vy, bola_radio) {
        this.bola_x = bola_x;
        this.bola_y = bola_y;
        this.bola_vx = bola_vx;
        this.bola_vy = bola_vy;
        this.bola_radio = bola_radio;
        this.lanzada = false;
        this.estela = [];
    }
}

class AgujeroNegro {
    constGravitacionalUniversal;
    masaAgujeroNegro;
    cVelocity;
    massivePosY;
    massivePosX;
    radioVisualAgujeroNegro;
    arrayDiscoAcrecion;

    constructor(constGravitacionalUniversal, masaAgujeroNegro, cVelocity, massivePosX, massivePosY, radioVisualAgujeroNegro) {
        this.constGravitacionalUniversal = constGravitacionalUniversal;
        this.masaAgujeroNegro = masaAgujeroNegro;
        this.cVelocity = cVelocity;
        this.massivePosX = massivePosX;
        this.massivePosY = massivePosY;
        this.radioHorizonte = (2 * this.constGravitacionalUniversal * this.masaAgujeroNegro) / Math.pow(this.cVelocity, 2);
        this.radioVisualAgujeroNegro = radioVisualAgujeroNegro;
        this.arrayDiscoAcrecion = [];

        ////////////////////////////////////////
        //Constructor para el disco de acreción
        ////////////////////////////////////////
        for(var i = 0; i < 500; i++) {

            var distancia = this.radioVisualAgujeroNegro + Math.random() * this.radioVisualAgujeroNegro;

            this.arrayDiscoAcrecion.push(new ParticulaDiscoAcrecion(Math.random() * (2 * Math.PI),
                                                                    this.radioVisualAgujeroNegro + Math.random() * this.radioVisualAgujeroNegro,
                                                                    1 / distancia * 60,
                                                                    Math.random() * 2 + 1,
                                                                    "orange"));
        }

    }
}

class ParticulaDiscoAcrecion {
    angulo;
    distancia;
    velocidadAngular;
    radio;
    color;

    constructor(angulo, distancia, velocidadAngular, radio, color) {
        this.angulo = angulo;
        this.distancia = distancia;
        this.velocidadAngular = velocidadAngular;
        this.radio = radio;
        this.color = color;
    }
}

/////////////////////////////////
//MAIN
/////////////////////////////////


//Dibujo base del canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
//El canvas ocupa el tamaño completo de la ventana.
c.width = window.innerWidth;
c.height = window.innerHeight;


//Posicion inicial del primer agujero negro, se pone en medio de la ventana.
var x_massive = c.width / 2;
var y_massive = c.height / 2;

var massiveObjArr = [];
var ballsArr = [];

//Se crea los primeros objetos del agujero negro y la bola iniciales y se meten en la primera posición del array.
massiveObjArr.push(new AgujeroNegro(100, 100000, 50, x_massive, y_massive, 110));
ballsArr.push(new Bola(c.width / 4, c.height / 1.3, 0, 0, 10));

/////////////////////////////////
//VARIABLES GLOBALES
/////////////////////////////////

//Variables de control para el control del Array.
var bolaSeleccionada = null;
var selectedObject = null;
var draggedObject = null;

//Variables booleanas
var juegoActivo = true;
var bolaLanzada = false;
var isDragging = false;
var isClicked = false;

//Variables numéricas de control, como la posición, posición del click, etc...
var tiempoAnterior = 0;
var mouseDownY = 0;
var mouseDownX = 0;
var mouseCurrentX = 0;
var mouseCurrentY = 0;
var factorLanzamiento = 4;

//Variable String para el control del evento para crear nuevos objetos
var activeMode = "throw";

//Elementos DOM para el control del evento para crear nuevos objetos.

var throwButton = document.getElementById("throwButton");
var addMassive = document.getElementById("addMassiveButton")
var addBall = document.getElementById("addBallButton");



/////////////////////////////////
//EVENTS - LISTENERS
/////////////////////////////////

c.addEventListener('mousedown', manageMouseDown);
c.addEventListener('mouseup', manageMouseUp);
c.addEventListener('mousemove', manageMouseMove);
c.addEventListener('contextmenu', manageRightClick);

//LISTENERS - Eventos de botones de crear nuevos objetos.

throwButton.addEventListener('mousedown', manageThrowButton)
addMassive.addEventListener('mousedown', manageAddMassiveButton)
addBall.addEventListener('mousedown', manageAddBallButton)

/////////////////////////////////
//LAMBDAS - FUNCIONES TEMPORALES
/////////////////////////////////


//Lambda para coger el valor del slider del radio de la bola.
document.getElementById("sliderRadioBall").addEventListener('input', function (e) {
    selectedObject.bola_radio = e.target.value;
    document.getElementById("valorRadioBall").textContent = e.target.value;
});

//Lambda pora coger el valor del slider del radio visual del agujero negro y actualizar el disco de acreción.
document.getElementById("visualRadioMassive").addEventListener('input', function (e) {
    selectedObject.radioVisualAgujeroNegro = Number(e.target.value);
    selectedObject.arrayDiscoAcrecion = [];

    for(var i = 0; i < 500; i++) {

            var distancia = selectedObject.radioVisualAgujeroNegro + Math.random() * selectedObject.radioVisualAgujeroNegro;

            selectedObject.arrayDiscoAcrecion.push(new ParticulaDiscoAcrecion(Math.random() * (2 * Math.PI),
                                                                    selectedObject.radioVisualAgujeroNegro + Math.random() * selectedObject.radioVisualAgujeroNegro,
                                                                    1 / distancia * 60,
                                                                    Math.random() * 2 + 1,
                                                                    "orange"));
        }

    document.getElementById("valueRadioMassive").textContent = e.target.value;
});


//Lambda para coger el valor del slider de la masa del agujero negro.
document.getElementById("massMassive").addEventListener('input', function (e) {
    selectedObject.masaAgujeroNegro = e.target.value;
    document.getElementById("valueMassMassive").textContent = e.target.value;
});


//Lambda para coger el valor del slider de la constante gravitacional universal
document.getElementById("gravitationalConstMassive").addEventListener('input', function (e) {
    selectedObject.constGravitacionalUniversal = e.target.value;
    document.getElementById("valueGravitationalConstMassive").textContent = e.target.value;
});


//Lambda para poder eliminar un objeto ball (Bola)
document.getElementById("deleteBallButton").addEventListener('click', function (e) {
    var index = ballsArr.indexOf(selectedObject);
    ballsArr.splice(index, 1);
    selectedObject = null;
    document.getElementById("ballMenu").style.display = "none";
});

//Lambda para poder eliminar un objeto masivo (Agujero negro)
document.getElementById("deleteMassiveButton").addEventListener('click', function (e) {
    var index = massiveObjArr.indexOf(selectedObject);
    massiveObjArr.splice(index, 1);
    selectedObject = null;
    document.getElementById("massiveMenu").style.display = "none";
});


//Lambda para poder cerrar la ventana de propiedades de la bola seleccionada.
document.getElementById("closeBallMenu").addEventListener('click', function(e) {
    document.getElementById("ballMenu").style.display = "none";
    selectedObject = null;
});


//Lambda para poder cerrar la ventana de propiedades del agujero negro seleccionado.
document.getElementById("closeMassiveMenu").addEventListener('click', function(e) {
    document.getElementById("massiveMenu").style.display = "none";
    selectedObject = null;
});

/////////////////////////////////
//gameLoop principal, funcion recursiva
/////////////////////////////////


function gameLoop(tiempoActual) {


    //DELTA TIME Δ: Delta time (Δt) es la diferencia de tiempo transcurido entre el frame actual y el frame anterior. Esto normaliza la velocidad para que sea consistente
    //independientemente del framerate = ((tiempoActual - tiempoAnterior) / 1000 = 0.016s = 60fps, 0.032s = 30fps). Toda multiplicación de fisicas se va a basar
    //en el Δt asignado por el calculo.
    if (!juegoActivo) return;
    var dt = (tiempoActual - tiempoAnterior) / 1000;
    tiempoAnterior = tiempoActual;

    ctx.clearRect(0, 0, c.width, c.height);
    dibujarGrid();
    actualizarFisica(dt);
    dibujarDiscoDeAcrecionDetras();
    actualizarDiscoAcrecion(dt);
    dibujarAgujeroNegro();
    dibujarDiscoDeAcrecionDelante();
    dibujarEstela();
    dibujarBola();
    dibujarLineaDireccionLanzamiento();
    dibujarPuntosPredictivos();
    
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1;
    requestAnimationFrame(gameLoop);
    
}

/////////////////////////////////
//FUNCIONES DE DIBUJO
/////////////////////////////////


function dibujarAgujeroNegro() {

    for (var i = 0; i < massiveObjArr.length; i++) {
        //Dibujo base del agujero negro.
        ctx.fillStyle = 'black';
        ctx.beginPath();

        /*
        * ctx.arc dibuja el circulo con varios parametros:
        * 2 primeros parametros: X e Y dentro del canvas para posicionarlo.
        * 3 parametro: radio del circulo.
        * 4 y 5 parametro: ángulo de inicio y fin.
        */
        ctx.arc(massiveObjArr[i].massivePosX, massiveObjArr[i].massivePosY, massiveObjArr[i].radioVisualAgujeroNegro, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

function dibujarBola() {

    //Se aplica a cada bola del canvas.
    for (var i = 0; i < ballsArr.length; i++) {

        //Inicializamos tMin en 1 (significa que, por defecto, está lejos de todo)
        var tMin = 1;

        //Se aplica a cada agujero negro del canvas.
        for(var j = 0; j < massiveObjArr.length; j++) {

            //Diferencia de posición en X e Y entre la bola y el agujero negro más cercano.
            var dx = massiveObjArr[j].massivePosX - ballsArr[i].bola_x;
            var dy = massiveObjArr[j].massivePosY - ballsArr[i].bola_y;

            //Distancia real entre la bola y el agujero negro (Pitágoras).
            var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            //tActual calcula la cercanía a ESTE agujero negro específico (entre 0 y 1)
            var tActual = d / (massiveObjArr[j].radioVisualAgujeroNegro * 3);
            tActual = Math.min(tActual, 1);

            //Si este agujero negro está más cerca que el que habíamos evaluado antes,
            //actualizamos tMin con el valor más peligroso/cercano.
            if (tActual < tMin) {
                tMin = tActual;
            }
        }

        //Una vez que el bucle 'j' ha terminado, ya sabemos con certeza cuál es el 
        //agujero negro más cercano. Ahora sí, aplicamos el exponente de agresividad.
        var tFinal = Math.pow(tMin, 5);

        ctx.fillStyle = `rgba(${Math.round(255 * (1 - tFinal))}, ${Math.round(255 * tFinal)}, ${Math.round(255 * tFinal)}, 1)`;
        ctx.beginPath();

        ctx.arc(ballsArr[i].bola_x, ballsArr[i].bola_y, ballsArr[i].bola_radio, 0, 2 * Math.PI);
        ctx.fill();
    }

}

function dibujarLineaDireccionLanzamiento() {

    //Primero se comprueba si el booleano isClicked es verdadero o falso, si no lo es, no hace nada.

    if (!isClicked) return;


    //Empieza en X e Y de donde haya clickado el usuario y se mueve por el valor de mouseCurrentX e Y, que se actualiza todo el rato.

    ctx.beginPath();
    ctx.moveTo(bolaSeleccionada.bola_x, bolaSeleccionada.bola_y);
    ctx.lineTo(mouseCurrentX, mouseCurrentY);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 5;
    ctx.stroke();
}


function dibujarGrid() {
    
    // Dibujamos 400 píxeles por fuera de la pantalla en todas las direcciones
    var margen = 400; 

    for(var i = -margen; i < c.width + margen; i += 50) {
        ctx.beginPath();
        
        for(var y = -margen; y <= c.height + margen; y += 10) {
            var xDeformado = i;
            var yDeformado = y;

            for(var j = 0; j < massiveObjArr.length; j++) {
                var dx = massiveObjArr[j].massivePosX - xDeformado;
                var dy = massiveObjArr[j].massivePosY - yDeformado;
                var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                var factor = massiveObjArr[j].radioVisualAgujeroNegro * 40;
                var deformacion = Math.min(factor / d, 40, d * 0.95);

                xDeformado += (dx / d) * deformacion;
                yDeformado += (dy / d) * deformacion;
            }

            ctx.lineTo(xDeformado, yDeformado);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.stroke();
    }

    for(var i = -margen; i < c.height + margen; i += 50) {
        ctx.beginPath();
        
        for(var x = -margen; x <= c.width + margen; x += 10) {
            
            var xDeformado = x;
            var yDeformado = i; 

            for(var j = 0; j < massiveObjArr.length; j++) {
                var dx = massiveObjArr[j].massivePosX - xDeformado;
                var dy = massiveObjArr[j].massivePosY - yDeformado;
                var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                var factor = massiveObjArr[j].radioVisualAgujeroNegro * 40;
                var deformacion = Math.min(factor / d, 40, d * 0.95);

                xDeformado += (dx / d) * deformacion;
                yDeformado += (dy / d) * deformacion;
            }

            ctx.lineTo(xDeformado, yDeformado);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.stroke();
    }
}

function dibujarEstela() {

    //Creación de estela visual en la bola.

    for(var i = 0; i < ballsArr.length; i++) {
        for(var j = 0; j < ballsArr[i].estela.length; j++) {

            //El radio de la estela es dependiendo de este calculo, el calculo hace que el contador se divida por el length del array y eso lo multiplica por el radio de la bola
            //Cada iteración hace que j vaya incrementando, esto hace que la bola vaya aumentando.

            var radioEstela = (j / ballsArr[i].estela.length) * ballsArr[i].bola_radio;
            var t = (j / ballsArr[i].estela.length);

            ctx.fillStyle = `rgba(${255 * (1-t)}, 255, 255, ${t})`;
            ctx.beginPath();
            ctx.arc(ballsArr[i].estela[j].x, ballsArr[i].estela[j].y, radioEstela, 0, 2 * Math.PI);
            ctx.fill();
        }

    }
}

/////////////////////////////////
//Funciones Disco de Acreción
/////////////////////////////////
//Estas dos funciones hacen el disco de acreción entero, para que no quede el disco "dentro" del agujero negro, se hacen 2 funciones, una que dibuje el disco de acreción por detrás y otra
//que dibuje el disco de acreción por delante.

function dibujarDiscoDeAcrecionDetras() {

    //Se aplica a cada agujero negro.
    for(var i = 0; i < massiveObjArr.length; i++) {

        //Se recorre cada array de cada agujero negro del disco de acreción y se hace la logica.
        for(var j = 0; j < massiveObjArr[i].arrayDiscoAcrecion.length; j++) {

            var distanciaParticulasDiscoAcrecion = massiveObjArr[i].arrayDiscoAcrecion[j].distancia;
            var t = (distanciaParticulasDiscoAcrecion - massiveObjArr[i].radioVisualAgujeroNegro) / massiveObjArr[i].radioVisualAgujeroNegro;

            //Posición en X e Y del disco de acreción.
            var accretionDiskX = massiveObjArr[i].massivePosX + distanciaParticulasDiscoAcrecion * Math.cos(massiveObjArr[i].arrayDiscoAcrecion[j].angulo);
            var accretionDiskY = massiveObjArr[i].massivePosY + (distanciaParticulasDiscoAcrecion * Math.sin(massiveObjArr[i].arrayDiscoAcrecion[j].angulo) * 0.4);

            if(Math.sin(massiveObjArr[i].arrayDiscoAcrecion[j].angulo) > 0) continue;

            ctx.fillStyle = `rgba(255, ${200 - Math.round(165 * t)}, 0, 1)`;
            ctx.beginPath();
            ctx.arc(accretionDiskX, accretionDiskY, massiveObjArr[i].arrayDiscoAcrecion[j].radio, 0,  2 * Math.PI);
            ctx.fill();
        }
    }
}


function dibujarDiscoDeAcrecionDelante() {

    //Se aplica a cada agujero negro.
    for(var i = 0; i < massiveObjArr.length; i++) {

        //Se recorre cada array de cada agujero negro del disco de acreción y se hace la logica.
        for(var j = 0; j < massiveObjArr[i].arrayDiscoAcrecion.length; j++) {

            var distanciaParticulasDiscoAcrecion = massiveObjArr[i].arrayDiscoAcrecion[j].distancia;
            var t = (distanciaParticulasDiscoAcrecion - massiveObjArr[i].radioVisualAgujeroNegro) / massiveObjArr[i].radioVisualAgujeroNegro;

            var accretionDiskX = massiveObjArr[i].massivePosX + distanciaParticulasDiscoAcrecion * Math.cos(massiveObjArr[i].arrayDiscoAcrecion[j].angulo);
            var accretionDiskY = massiveObjArr[i].massivePosY + (distanciaParticulasDiscoAcrecion * Math.sin(massiveObjArr[i].arrayDiscoAcrecion[j].angulo) * 0.4);

            if(Math.sin(massiveObjArr[i].arrayDiscoAcrecion[j].angulo) < 0) continue;

            ctx.fillStyle = `rgba(255, ${200 - Math.round(180 * t)}, 0, 1)`;
            ctx.beginPath();
            ctx.arc(accretionDiskX, accretionDiskY, massiveObjArr[i].arrayDiscoAcrecion[j].radio * 1.2, 0,  2 * Math.PI);
            ctx.fill();
        }
    }

}

/////////////////////////////////
//FUNCION DE DIBUJO + FISICA
/////////////////////////////////

function dibujarPuntosPredictivos() {

    if (!isClicked) return;

    //Radio inicial del trazo predictivo
    var radioBolasPredictivas = 4;

    //Valores iniciales

    //simVx/Vy guarda la velocidad antes de lanzar la bola, guarda la posicion en X e Y de donde el usuario a clickado y lo resta con el valor actual de donde esté el ratón en cada frame
    //Esto guarda la diferencia y hace que las bolas aparezcan al contrario de donde este el ratón. Se multiplica el resultado por el factor de lanzamiento que controla la distancia en el
    //que llega el trazo predictivo.
    var simVx = (mouseDownX - mouseCurrentX) * factorLanzamiento;
    var simVy = (mouseDownY - mouseCurrentY) * factorLanzamiento;


    //simX/Y guarda la posición de la bola seleccionada en X e Y
    var simX = bolaSeleccionada.bola_x;
    var simY = bolaSeleccionada.bola_y;

    //1º for: repite el número de veces que aparece la bola predictiva 
    for (var i = 0; i < 6; i++) {

        //Inicialización de la aceleración.
        var simAx = 0;
        var simAy = 0;


        //2º for: calcula la física para cada bola predictiva en cada agujero negro en el Array.

        for (var j = 0; j < massiveObjArr.length; j++) {

            //Calcular la distancia entre las bolas predictivas y el agujero negro.
            dx = massiveObjArr[j].massivePosX - simX;
            dy = massiveObjArr[j].massivePosY - simY;

            //Diferencia real entre las bolas predictivas y el agujero negro. (Usando pitágoras);
            d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            //Magnitud de la fuerza gravitacional - crece mucho al acercarse.
            massiveForce = (massiveObjArr[j].constGravitacionalUniversal * massiveObjArr[j].masaAgujeroNegro) / (d * d);

            massiveForce = Math.min(massiveForce, 2000);

            //Aceleración final que se suma a la velocidad de la bola por cada frame.
            simAx += (dx / d) * massiveForce;
            simAy += (dy / d) * massiveForce;

        }



        //Velocidad actual de la bola en X e Y - se acumula cada frame.
        simVx += simAx * 0.1;
        simVy += simAy * 0.1;

        simX += simVx * 0.1;
        simY += simVy * 0.1;

        if (radioBolasPredictivas <= 1) break;

        ctx.fillStyle = 'rgba(0, 255, 255, 0.4';
        ctx.beginPath();
        ctx.arc(simX, simY, radioBolasPredictivas, 0, 2 * Math.PI);
        ctx.fill();

        radioBolasPredictivas -= 0.5;

    }
}

/////////////////////////////////
//FUNCION FISICA PRINCIPAL
/////////////////////////////////

function actualizarFisica(dt) {


    for (var i = 0; i < ballsArr.length; i++) {
        if (ballsArr[i].lanzada) {

            

            var ax = 0;
            var ay = 0;

            var absorbida = false;

            for (var j = 0; j < massiveObjArr.length; j++) {

                //Diferencia de posición en X e Y entre la bola y el agujero negro.
                var dx = massiveObjArr[j].massivePosX - ballsArr[i].bola_x;
                var dy = massiveObjArr[j].massivePosY - ballsArr[i].bola_y;

                //Distancia real entre la bola y el agujero negro (Usando pitágoras).
                var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                //Magnitud de la fuerza gravitacional - crece mucho al acercarse.
                var massiveForce = (massiveObjArr[j].constGravitacionalUniversal * massiveObjArr[j].masaAgujeroNegro) / (d * d);

                var fuerzaMaxima = 5000;
                massiveForce = Math.min(massiveForce, fuerzaMaxima);

                //Aceleración final que se suma a la velocidad de la bola por cada frame.
                ax += (dx / d) * massiveForce;
                ay += (dy / d) * massiveForce;



                if (d < massiveObjArr[j].radioVisualAgujeroNegro) {
                    console.log(`Bola absorbida`);
                    ballsArr.splice(i, 1);
                    absorbida = true;
                    break;
                }
            }

            if (absorbida) continue;

            //bola_vx/vy = Veloicdad actual de la bola en X e Y - se acumula cada frame
            ballsArr[i].bola_vx += ax * dt;
            ballsArr[i].bola_vy += ay * dt;

            var velocidadMaxima = 500;
            ballsArr[i].bola_vx = Math.max(-velocidadMaxima, Math.min(velocidadMaxima, ballsArr[i].bola_vx));
            ballsArr[i].bola_vy = Math.max(-velocidadMaxima, Math.min(velocidadMaxima, ballsArr[i].bola_vy));

            //Se actualiza la posición de la bola en X e Y con la velocidad actual acumulada en cada frame.
            ballsArr[i].bola_x += ballsArr[i].bola_vx * dt;
            ballsArr[i].bola_y += ballsArr[i].bola_vy * dt;

            ballsArr[i].estela.push({
                x: ballsArr[i].bola_x,
                y: ballsArr[i].bola_y
            })

            if (ballsArr[i].estela.length > 20) {
                ballsArr[i].estela.shift();
            }
        }
    }
}

///////////////////////////////////
//FUNCION FISICA DISCO DE ACRECIÓN
///////////////////////////////////

function actualizarDiscoAcrecion(dt) {
    for(var i = 0; i < massiveObjArr.length; i++) {
        for(var j = 0; j < massiveObjArr[i].arrayDiscoAcrecion.length; j++) {

            //Tercera ley de Kepler: angulo += suma el angulo actual | velocidadAngular * dt la velocidad angular multiplicada por el delta time. Cada frame
            //la particula avanza un poco en su órbita, cuanto más lejos del horizonte de eventos, más lento va a ir, igual que los planetas orbitando sobre el Sol, los planetas
            //más lejanos tardan mas en dar una vuelta al sol.
            massiveObjArr[i].arrayDiscoAcrecion[j].angulo += massiveObjArr[i].arrayDiscoAcrecion[j].velocidadAngular * dt;
        }
    }
}

/////////////////////////////////
//MANEJO DE EVENTOS
/////////////////////////////////

function manageMouseDown(e) {

    if (e.button !== 0) return;

    //Guarda en X e Y la posición actual del ratón.
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    switch (activeMode) {

        //throw se encarga del poder lanzar la bola donde quieras.
        case "throw":

            for (var i = 0; i < ballsArr.length; i++) {

                //Se calcula la distancia en X e Y de la bola seleccionada.
                dx = mouseDownX - ballsArr[i].bola_x;
                dy = mouseDownY - ballsArr[i].bola_y;

                //Usando pitágoras calculamos la distancia real.
                d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                //Usando el radio de la bola (Algo mas grande para comodidad del usuario) se hace la logica de tirar la bola.
                if (d < ballsArr[i].bola_radio * 4) {

                    //Pasamos el flag a true
                    isClicked = true;
                    //Seleccionamos la bola del array que hemos elegido.
                    bolaSeleccionada = ballsArr[i];

                    //Paramos completamente la bola para que pueda ser lanzada de nuevo.
                    bolaSeleccionada.bola_vx = 0;
                    bolaSeleccionada.bola_vy = 0;

                    //Quitamos el flag de la bola seleccionada.
                    bolaSeleccionada.lanzada = false;

                    //Quitamos el flag universal.
                    bolaLanzada = false;
                }
            }

            //Logica para arrastrar el agujero negro.
            for (var j = 0; j < massiveObjArr.length; j++) {
                dx = mouseDownX - massiveObjArr[j].massivePosX;
                dy = mouseDownY - massiveObjArr[j].massivePosY;

                d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                if (d < massiveObjArr[j].radioVisualAgujeroNegro) {
                    isDragging = true;
                    draggedObject = massiveObjArr[j];
                }
            }

            break;
        //Lógica para crear un nuevo agujero negro.    
        case "addMassive":
            //DEBUG EN CONSOLA
            console.log("Creando Massive");
            //Metemos en el array de massiveObj un nuevo agujero negro con unas propiedades base.
            massiveObjArr.push(new AgujeroNegro(100, 100000, 50, mouseDownX, mouseDownY, 110))
            //Actualizamos automáticamente el activeMode para que sea throw y se pueda lanzar la bola directamente sin tener que clickar un botón.
            activeMode = "throw";
            break;
        //Lógica para crear una nueva bola.
        case "addBall":
            //DEBUG EN CONSOLA
            console.log("Creando bola");
            //Metemos en el array de balls una nueva bola con unas propiedades base.
            ballsArr.push(new Bola(mouseDownX, mouseDownY, 0, 0, 10))
            //Actualizamos automáticamente el activeMode para que sea throw y se pueda lanzar la bola directamente sin tener que clickar un botón.
            activeMode = "throw";
            break;
    }
}

//Funcion para el mouseUp
function manageMouseUp(e) {


    //Si el flag de arrastrar es true, se pone en false, y el draggedObject pasa a null.
    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        return;
    }
    if (bolaLanzada) return;
    if (!isClicked) return;
    
    //Aqui se aplica la velocidad del lanzamiento al soltar el click
    bolaSeleccionada.bola_vx = (mouseDownX - e.clientX) * factorLanzamiento;
    bolaSeleccionada.bola_vy = (mouseDownY - e.clientY) * factorLanzamiento;

    //Se actualizan los flags, isClicked se pasa a false, bolaLanzada pasa a true y la bola seleccionada pasa a lanzada = true;
    isClicked = false;
    bolaLanzada = true;
    bolaSeleccionada.lanzada = true;
}

//Funcion del MouseMove, gestiona el movimiento del ratón.
function manageMouseMove(e) {

    //Actualiza la posicion actual de la posicion X e Y.
    mouseCurrentX = e.clientX;
    mouseCurrentY = e.clientY;

    //Si el flag es True el agujero negro se actualiza cada frame a la posicion actual del raton en X e Y.
    if (isDragging) {
        draggedObject.massivePosX = mouseCurrentX;
        draggedObject.massivePosY = mouseCurrentY;
    }

}

/////////////////////////////////
//BOTONES activeMode
/////////////////////////////////

//e.stopPropagation() hace que el click no pueda interactuar con los objetos que hayan detrás de este.
function manageThrowButton(e) {
    activeMode = "throw";
    e.stopPropagation();
}

function manageAddMassiveButton(e) {
    activeMode = "addMassive";
    e.stopPropagation();
}

function manageAddBallButton(e) {

    activeMode = "addBall";
    e.stopPropagation();

}

/////////////////////////////////
//FUNCION RIGHTCLICK
/////////////////////////////////

function manageRightClick(e) {

    //Guardamos la posición del clickDerecho en X e Y.
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    //Quitamos el click derecho del navegador predeterminado.
    e.preventDefault();


    //Recorremos el array de balls
    for (var i = 0; i < ballsArr.length; i++) {

        //Calcula la distancia entre donde se hizo click y el centro de cada bola con Pitágoras. 
        dx = mouseDownX - ballsArr[i].bola_x;
        dy = mouseDownY - ballsArr[i].bola_y;

        d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        //Si click fue dentro de la bola (distancia menor al radio * 4) selecciona esa bola para que muestre el valor correcto.
        if (d < ballsArr[i].bola_radio * 4) {
            selectedObject = ballsArr[i];
            document.getElementById("ballMenu").style.display = "flex";
            document.getElementById("massiveMenu").style.display = "none";

            document.getElementById("sliderRadioBall").value = selectedObject.bola_radio;
            document.getElementById("valorRadioBall").textContent = selectedObject.bola_radio;

            return;
        }
    }

    //Recorremos el array de massiveObj
    for (var j = 0; j < massiveObjArr.length; j++) {

        //Calcula la distancia entre donde se hizo click y el centro de cada bola con Pitágoras. 
        dx = mouseDownX - massiveObjArr[j].massivePosX;
        dy = mouseDownY - massiveObjArr[j].massivePosY;

        d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        //Si click fue dentro del agujero negro selecciona ese agujero negro para que muestre el valor correcto.
        if (d < massiveObjArr[j].radioVisualAgujeroNegro) {
            selectedObject = massiveObjArr[j];
            document.getElementById("ballMenu").style.display = "none";
            document.getElementById("massiveMenu").style.display = "flex";

            document.getElementById("visualRadioMassive").value = selectedObject.radioVisualAgujeroNegro;
            document.getElementById("valueRadioMassive").textContent = selectedObject.radioVisualAgujeroNegro;

            document.getElementById("massMassive").value = selectedObject.masaAgujeroNegro;
            document.getElementById("valueMassMassive").textContent = selectedObject.masaAgujeroNegro;

            document.getElementById("gravitationalConstMassive").value = selectedObject.constGravitacionalUniversal;
            document.getElementById("valueGravitationalConstMassive").textContent = selectedObject.constGravitacionalUniversal;

            return;
        }
    }
}

requestAnimationFrame(gameLoop);
