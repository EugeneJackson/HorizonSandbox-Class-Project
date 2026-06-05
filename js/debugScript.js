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


massiveObjArr.push(new AgujeroNegro(100, 100000, 50, x_massive, y_massive, 110));
ballsArr.push(new Bola(c.width / 4, c.height / 1.3, 0, 0, 10));

var bolaSeleccionada = null;
var tiempoAnterior = 0;
var juegoActivo = true;
var bolaLanzada = false;
var selectedObject = null;
var draggedObject = null;
var isDragging = false;

var activeMode = "throw";
var throwButton = document.getElementById("throwButton");
var addMassive = document.getElementById("addMassiveButton")
var addBall = document.getElementById("addBallButton");

var mouseDownX = 0;
var mouseDownY = 0;
var isClicked = false;
var factorLanzamiento = 4;
var mouseCurrentX = 0;
var mouseCurrentY = 0;


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

document.getElementById("visualRadioMassive").addEventListener('input', function (e) {
    selectedObject.radioVisualAgujeroNegro = e.target.value;
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
    for(var i = 0; i < c.width; i += 50) {

        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, c.height);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.stroke();
    }

    for(var i = 0; i < c.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(c.width, i);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.stroke();
    }
}

function dibujarVectores() {

    var factorVectorVelocidad = 0.3;
    var factorVectorFuerza = 0.4;

    
    for (var i = 0; i < ballsArr.length; i++) {

        var anguloVelocidad = Math.atan2(ballsArr[i].bola_vy, ballsArr[i].bola_vx);
        var anguloFuerza = Math.atan2(ballsArr[i].bola_ay, ballsArr[i].bola_ax);
        
        var puntaXVelocidad = ballsArr[i].bola_x + (ballsArr[i].bola_vx * factorVectorVelocidad);
        var puntaYVelocidad = ballsArr[i].bola_y + (ballsArr[i].bola_vy * factorVectorVelocidad);
        var puntaXFuerza = ballsArr[i].bola_x + (ballsArr[i].bola_ax * factorVectorFuerza);
        var puntaYFuerza = ballsArr[i].bola_y + (ballsArr[i].bola_ay * factorVectorFuerza);
        var tamPunta = 8;

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

    for(var i = 0; i < massiveObjArr.length; i++) {

        for(var j = 0; j < massiveObjArr[i].arrayDiscoAcrecion.length; j++) {

            var distanciaParticulasDiscoAcrecion = massiveObjArr[i].arrayDiscoAcrecion[j].distancia;
            var t = (distanciaParticulasDiscoAcrecion - massiveObjArr[i].radioVisualAgujeroNegro) / massiveObjArr[i].radioVisualAgujeroNegro;

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

    for(var i = 0; i < massiveObjArr.length; i++) {

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

    var texto = "";

    for (var i = 0; i < ballsArr.length; i++) {
        texto +=
        `Bola ${i + 1} <br>
        X: ${Math.round(ballsArr[i].bola_x)} <br>
        Y: ${Math.round(ballsArr[i].bola_y)} <br>
        Velocidad X: ${Math.round(ballsArr[i].bola_vx)} <br>
        Velocidad Y: ${Math.round(ballsArr[i].bola_vy)} <br>
        ¿Lanzada?: ${ballsArr[i].lanzada} <br>`
    }

    document.getElementById("debugPanel").innerHTML = texto;
}

requestAnimationFrame(gameLoop);
