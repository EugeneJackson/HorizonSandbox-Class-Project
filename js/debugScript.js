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
    bola_ax;
    bola_ay;
    estela;
    

    constructor(bola_x, bola_y, bola_vx, bola_vy, bola_radio) {
        this.bola_x = bola_x;
        this.bola_y = bola_y;
        this.bola_vx = bola_vx;
        this.bola_vy = bola_vy;
        this.bola_radio = bola_radio;
        this.lanzada = false;
        this.bola_ax = 0;
        this.bola_ay = 0;
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

var x_massive = c.width / 2;
var y_massive = c.height / 2;

var massiveObjArr = [];
var ballsArr = [];


//Se crea los primeros objetos del agujero negro y la bola iniciales y se meten en la primera posición del array.
massiveObjArr.push(new AgujeroNegro(100, 100000, 50, x_massive, y_massive, 110));
ballsArr.push(new Bola(c.width / 4, c.height / 1.3, 0, 0, 10));

//Variables booleanas
var juegoActivo = true;
var bolaLanzada = false;
var isDragging = false;
var isClicked = false;

//Variables numéricas de control, como la posición, posición del click, etc...
var tiempoAnterior = 0;
var mouseDownX = 0;
var mouseDownY = 0;
var mouseCurrentX = 0;
var mouseCurrentY = 0;
var factorLanzamiento = 4;

//Variables de control para el control del Array.
var bolaSeleccionada = null;
var selectedObject = null;
var draggedObject = null;

var activeMode = "throw";
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

throwButton.addEventListener('mousedown', manageThrowButton)
addMassive.addEventListener('mousedown', manageAddMassiveButton)
addBall.addEventListener('mousedown', manageAddBallButton)

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

document.getElementById("massMassive").addEventListener('input', function (e) {
    selectedObject.masaAgujeroNegro = e.target.value;
    document.getElementById("valueMassMassive").textContent = e.target.value;
})

document.getElementById("gravitationalConstMassive").addEventListener('input', function (e) {
    selectedObject.constGravitacionalUniversal = e.target.value;
    document.getElementById("valueGravitationalConstMassive").textContent = e.target.value;
})

document.getElementById("deleteBallButton").addEventListener('click', function (e) {
    var index = ballsArr.indexOf(selectedObject);
    ballsArr.splice(index, 1);
    selectedObject = null;
    document.getElementById("ballMenu").style.display = "none";
})

document.getElementById("deleteMassiveButton").addEventListener('click', function (e) {
    var index = massiveObjArr.indexOf(selectedObject);
    massiveObjArr.splice(index, 1);
    selectedObject = null;
    document.getElementById("massiveMenu").style.display = "none";
})

document.getElementById("closeBallMenu").addEventListener('click', function(e) {
    document.getElementById("ballMenu").style.display = "none";
    selectedObject = null;
})

document.getElementById("closeMassiveMenu").addEventListener('click', function(e) {
    document.getElementById("massiveMenu").style.display = "none";
    selectedObject = null;
})

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
    actualizarDebugPanel();
    actualizarFisica(dt);
    dibujarDiscoDeAcrecionDetras();
    actualizarDiscoAcrecion(dt);
    dibujarAgujeroNegro();
    dibujarDiscoDeAcrecionDelante();
    dibujarEstela();
    dibujarBola();
    dibujarLineaDireccionLanzamiento();
    dibujarPuntosPredictivos();
     dibujarVectores();
    
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

    for (var i = 0; i < ballsArr.length; i++) {
        ctx.fillStyle = '#00FFFF';
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

function dibujarVectores() {

    //Variables de control para escalar el tamaño de los vectores. Nos permiten "exagerar" o reducir visualmente
    //las flechas en el modo debug para que no se salgan de la pantalla ni sean invisibles.
    var factorVectorVelocidad = 0.3;
    var factorVectorFuerza = 0.4;

    //Recorremos el array de balls para que los vectores se apliquen a todas las bolas.
    for (var i = 0; i < ballsArr.length; i++) {

        //Calculamos el ángulo exacto de la trayectoria utilizando la arcotangente (atan2) de las velocidades y aceleraciones.
        //Esto nos da los radianes necesarios para saber hacia dónde debe rotar la flecha.
        var anguloVelocidad = Math.atan2(ballsArr[i].bola_vy, ballsArr[i].bola_vx);
        var anguloFuerza = Math.atan2(ballsArr[i].bola_ay, ballsArr[i].bola_ax);

        //Proyectamos las coordenadas (X, Y) donde terminará la punta de cada vector.
        //Sumamos a la posición actual de la bola su velocidad/aceleración multiplicada por el factor de escala visual.
        var puntaXVelocidad = ballsArr[i].bola_x + (ballsArr[i].bola_vx * factorVectorVelocidad);
        var puntaYVelocidad = ballsArr[i].bola_y + (ballsArr[i].bola_vy * factorVectorVelocidad);
        var puntaXFuerza = ballsArr[i].bola_x + (ballsArr[i].bola_ax * factorVectorFuerza);
        var puntaYFuerza = ballsArr[i].bola_y + (ballsArr[i].bola_ay * factorVectorFuerza);
        var tamPunta = 8;

        //Dibujamos las puntas de las flechas (los triángulos). Para abrir los vértices hacia atrás, restamos y sumamos 0.6
        //radianes al ángulo original del vector aplicando senos y cosenos para calcular las coordenadas exactas de las esquinas.
        //Trazamos el cuerpo principal de los vectores: una línea recta que nace exactamente en las coordenadas (X, Y) del centro de la bola
        //y muere en las coordenadas de la punta que calculamos al principio.
        ctx.beginPath();
        ctx.moveTo(puntaXVelocidad, puntaYVelocidad);
        ctx.lineTo(puntaXVelocidad - tamPunta * Math.cos(anguloVelocidad - 0.6), puntaYVelocidad - tamPunta * Math.sin(anguloVelocidad - 0.6));
        ctx.lineTo(puntaXVelocidad - tamPunta * Math.cos(anguloVelocidad + 0.6), puntaYVelocidad - tamPunta * Math.sin(anguloVelocidad + 0.6));
        ctx.fillStyle = "red";
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(puntaXFuerza, puntaYFuerza);
        ctx.lineTo(puntaXFuerza - tamPunta * Math.cos(anguloFuerza - 0.6), puntaYFuerza - tamPunta * Math.sin(anguloFuerza - 0.6));
        ctx.lineTo(puntaXFuerza - tamPunta * Math.cos(anguloFuerza + 0.6), puntaYFuerza - tamPunta * Math.sin(anguloFuerza + 0.6))
        ctx.fillStyle = "blue";
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(ballsArr[i].bola_x, ballsArr[i].bola_y);
        ctx.lineTo(ballsArr[i].bola_x + (ballsArr[i].bola_vx * factorVectorVelocidad), ballsArr[i].bola_y + (ballsArr[i].bola_vy * factorVectorVelocidad));
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ballsArr[i].bola_x, ballsArr[i].bola_y);
        ctx.lineTo(ballsArr[i].bola_x + (ballsArr[i].bola_ax * factorVectorFuerza), ballsArr[i].bola_y + (ballsArr[i].bola_ay * factorVectorFuerza));
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

}

function dibujarEstela() {
    for(var i = 0; i < ballsArr.length; i++) {
        for(var j = 0; j < ballsArr[i].estela.length; j++) {
            var radioEstela = (j / ballsArr[i].estela.length) * ballsArr[i].bola_radio;

            ctx.fillStyle = "#00FFFF";
            ctx.beginPath();
            ctx.arc(ballsArr[i].estela[j].x, ballsArr[i].estela[j].y, radioEstela, 0, 2 * Math.PI);
            ctx.fill();
        }

    }
}

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

    var radioBolasPredictivas = 4;

    var simVx = (mouseDownX - mouseCurrentX) * factorLanzamiento;
    var simVy = (mouseDownY - mouseCurrentY) * factorLanzamiento;
    var simX = bolaSeleccionada.bola_x;
    var simY = bolaSeleccionada.bola_y;

    for (var i = 0; i < 5; i++) {

        var simAx = 0;
        var simAy = 0;


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
                    console.log("Juego terminado");
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

            //Se guarda la aceleracion en X e Y para poder usarlo en el DEBUG.
            ballsArr[i].bola_ax = ax;
            ballsArr[i].bola_ay = ay;

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

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    switch (activeMode) {
        case "throw":

            for (var i = 0; i < ballsArr.length; i++) {

                dx = mouseDownX - ballsArr[i].bola_x;
                dy = mouseDownY - ballsArr[i].bola_y;

                d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                if (d < ballsArr[i].bola_radio * 4) {
                    isClicked = true;
                    bolaSeleccionada = ballsArr[i];

                    bolaSeleccionada.bola_vx = 0;
                    bolaSeleccionada.bola_vy = 0;

                    bolaSeleccionada.lanzada = false;

                    bolaLanzada = false;
                }
            }

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
        case "addMassive":
            console.log("Creando Massive");
            massiveObjArr.push(new AgujeroNegro(100, 500000, 50, mouseDownX, mouseDownY, 110))
            activeMode = "throw";
            break;
        case "addBall":
            console.log("Creando bola");
            ballsArr.push(new Bola(mouseDownX, mouseDownY, 0, 0, 10))
            activeMode = "throw";
            break;
    }
}

function manageMouseUp(e) {

    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        return;
    }
    if (bolaLanzada) return;
    if (!isClicked) return;
    


    bolaSeleccionada.bola_vx = (mouseDownX - e.clientX) * factorLanzamiento;
    bolaSeleccionada.bola_vy = (mouseDownY - e.clientY) * factorLanzamiento;

    isClicked = false;
    bolaLanzada = true;
    bolaSeleccionada.lanzada = true;



}

function manageMouseMove(e) {

    mouseCurrentX = e.clientX;
    mouseCurrentY = e.clientY;

    if (isDragging) {
        draggedObject.massivePosX = mouseCurrentX;
        draggedObject.massivePosY = mouseCurrentY;
    }

}


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

function manageRightClick(e) {

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    e.preventDefault();

    for (var i = 0; i < ballsArr.length; i++) {
        dx = mouseDownX - ballsArr[i].bola_x;
        dy = mouseDownY - ballsArr[i].bola_y;

        d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (d < ballsArr[i].bola_radio * 4) {
            selectedObject = ballsArr[i];
            document.getElementById("ballMenu").style.display = "flex";
            document.getElementById("massiveMenu").style.display = "none";

            document.getElementById("sliderRadioBall").value = selectedObject.bola_radio;
            document.getElementById("valorRadioBall").textContent = selectedObject.bola_radio;

            return;
        }
    }

    for (var j = 0; j < massiveObjArr.length; j++) {
        dx = mouseDownX - massiveObjArr[j].massivePosX;
        dy = mouseDownY - massiveObjArr[j].massivePosY;

        d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

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

/////////////////////////////////
//FUNCION EXTRA - DEBUG
/////////////////////////////////

function actualizarDebugPanel() {

    //Inicializamos una variable de texto vacía que actuará como contenedor temporal. Aquí iremos acumulando toda la información de las bolas antes de enviarla de golpe al HTML.
    var texto = "";

    //Recorremos el array de bolas y utilizamos "template literals" (comillas invertidas) para generar el HTML dinámicamente.
    //Extraemos y redondeamos (con Math.round para evitar decimales infinitos) la posición, la velocidad y el estado lógico de cada bola.
    for (var i = 0; i < ballsArr.length; i++) {
        texto +=
        `Bola ${i + 1} <br>
        X: ${Math.round(ballsArr[i].bola_x)} <br>
        Y: ${Math.round(ballsArr[i].bola_y)} <br>
        Velocidad X: ${Math.round(ballsArr[i].bola_vx)} <br>
        Velocidad Y: ${Math.round(ballsArr[i].bola_vy)} <br>
        ¿Lanzada?: ${ballsArr[i].lanzada} <br>`
    }

    //Interacción directa con el DOM: buscamos el panel de debug en nuestra estructura HTML
    //y le inyectamos todo el bloque de texto generado para actualizar los datos en pantalla en tiempo real.
    document.getElementById("debugPanel").innerHTML = texto;
}

requestAnimationFrame(gameLoop);
