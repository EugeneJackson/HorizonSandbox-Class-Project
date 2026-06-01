/////////////////////////////////
//CLASES
/////////////////////////////////


class Bola {
    bola_x;
    bola_y;
    bola_vx;
    bola_vy;
    bola_radio;

    constructor(bola_x, bola_y, bola_vx, bola_vy, bola_radio) {
        this.bola_x = bola_x;
        this.bola_y = bola_y;
        this.bola_vx = bola_vx;
        this.bola_vy = bola_vy;
        this.bola_radio = bola_radio;
    }
}

class AgujeroNegro {
    constGravitacionalUniversal;
    masaAgujeroNegro;
    cVelocity;
    massivePosY;
    massivePosX;
    radioVisualAgujeroNegro;

    constructor(constGravitacionalUniversal, masaAgujeroNegro, cVelocity, massivePosX, massivePosY, radioVisualAgujeroNegro) {
        this.constGravitacionalUniversal = constGravitacionalUniversal;
        this.masaAgujeroNegro = masaAgujeroNegro;
        this.cVelocity = cVelocity;
        this.massivePosX = massivePosX;
        this.massivePosY = massivePosY;
        this.radioHorizonte = (2 * this.constGravitacionalUniversal * this.masaAgujeroNegro) / Math.pow(this.cVelocity, 2);
        this.radioVisualAgujeroNegro = radioVisualAgujeroNegro;
    } 
}

/////////////////////////////////
//MAIN
/////////////////////////////////


//Dibujo base del canvas
var c = document.getElementById("firstSandboxCanvas");
var ctx = c.getContext("2d");
//El canvas ocupa el tamaño completo de la ventana.
c.width = window.innerWidth;
c.height = window.innerHeight;

var x_massive = c.width / 2;
var y_massive = c.height / 2;


const massiveObj = new AgujeroNegro(100, 500000, 50, x_massive, y_massive, 110);
const ball = new Bola(c.width / 4, c.height / 1.3, 0, 0, 10);

var tiempoAnterior = 0;
var juegoActivo = true;
var bolaLanzada = false;

var mouseDownX = 0;
var mouseDownY = 0;
var isClicked = false;
var factorLanzamiento = 4;
var mouseCurrentX = 0;
var mouseCurrentY = 0;

c.addEventListener('mousedown', manageMouseDown);
c.addEventListener('mouseup', manageMouseUp);
c.addEventListener('mousemove', manageMouseMove);

/////////////////////////////////
//gameLoop principal, funcion recursiva
/////////////////////////////////


function gameLoop(tiempoActual) {

    if(!juegoActivo) return;
    var dt = (tiempoActual - tiempoAnterior) / 1000;
    tiempoAnterior = tiempoActual;

    ctx.clearRect(0, 0, c.width, c.height);
    actualizarFisica(dt);
    dibujarAgujeroNegro();
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

    //Dibujo base del agujero negro.
    ctx.fillStyle = 'black';
    ctx.beginPath();

    /*
    * ctx.arc dibuja el circulo con varios parametros:
    * 2 primeros parametros: X e Y dentro del canvas para posicionarlo.
    * 3 parametro: radio del circulo.
    * 4 y 5 parametro: ángulo de inicio y fin.
    */
    ctx.arc(massiveObj.massivePosX, massiveObj.massivePosY, massiveObj.radioVisualAgujeroNegro, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function dibujarBola() {
    ctx.fillStyle = '#7EBDC2';
    ctx.beginPath();

    ctx.arc(ball.bola_x, ball.bola_y, ball.bola_radio, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

}

function dibujarLineaDireccionLanzamiento() {

    //Primero se comprueba si el booleano isClicked es verdadero o falso, si no lo es, no hace nada.

    if(!isClicked) return;


    //Empieza en X e Y de donde haya clickado el usuario y se mueve por el valor de mouseCurrentX e Y, que se actualiza todo el rato.
    ctx.beginPath();
    ctx.moveTo(ball.bola_x, ball.bola_y);
    ctx.lineTo(mouseCurrentX, mouseCurrentY);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.stroke();
}

/////////////////////////////////
//FUNCION DE DIBUJO + FISICA
/////////////////////////////////

function dibujarPuntosPredictivos() {

    if(!isClicked) return;

    var radioBolasPredictivas = 3.2;

    var simVx = (mouseDownX - mouseCurrentX) * factorLanzamiento;
    var simVy = (mouseDownY - mouseCurrentY) * factorLanzamiento;
    var simX = ball.bola_x;
    var simY = ball.bola_y;

    for(var i = 0; i < 5; i++) {

        //Calcular la distancia entre las bolas predictivas y el agujero negro.
        dx = massiveObj.massivePosX - simX;
        dy = massiveObj.massivePosY - simY;

        //Diferencia real entre las bolas predictivas y el agujero negro. (Usando pitágoras);
        d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        //Magnitud de la fuerza gravitacional - crece mucho al acercarse.
        massiveForce = (massiveObj.constGravitacionalUniversal * massiveObj.masaAgujeroNegro) / (d * d);

        //Aceleración final que se suma a la velocidad de la bola por cada frame.
        var simAx = (dx / d) * massiveForce;
        var simAy = (dy / d) * massiveForce;

        //Velocidad actual de la bola en X e Y - se acumula cada frame.
        simVx += simAx * 0.1;
        simVy += simAy * 0.1;

        simX += simVx * 0.1;
        simY += simVy * 0.1;

        if(radioBolasPredictivas <= 1) break;

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(simX, simY, radioBolasPredictivas, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        radioBolasPredictivas -= 0.5;

    }
}

/////////////////////////////////
//FUNCION FISICA PRINCIPAL
/////////////////////////////////

function actualizarFisica(dt) {

    if (bolaLanzada) {
        //Diferencia de posición en X e Y entre la bola y el agujero negro.
        var dx = massiveObj.massivePosX - ball.bola_x;
        var dy = massiveObj.massivePosY - ball.bola_y;

        //Distancia real entre la bola y el agujero negro (Usando pitágoras).
        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        //Magnitud de la fuerza gravitacional - crece mucho al acercarse.
        var massiveForce = (massiveObj.constGravitacionalUniversal * massiveObj.masaAgujeroNegro) / (d * d);

        //Aceleración final que se suma a la velocidad de la bola por cada frame.
        var ax = (dx / d) * massiveForce;
        var ay = (dy / d) * massiveForce;

        //===================================================================================================

        //bola_vx/vy = Veloicdad actual de la bola en X e Y - se acumula cada frame
        ball.bola_vx += ax * dt;
        ball.bola_vy += ay * dt;

        var velocidadMaxima = 500;
        ball.bola_vx = Math.max(-velocidadMaxima, Math.min(velocidadMaxima, ball.bola_vx));
        ball.bola_vy = Math.max(-velocidadMaxima, Math.min(velocidadMaxima, ball.bola_vy));

        //Se actualiza la posición de la bola en X e Y con la velocidad actual acumulada en cada frame.
        ball.bola_x += ball.bola_vx * dt;
        ball.bola_y += ball.bola_vy * dt;

        if (d < massiveObj.radioVisualAgujeroNegro) {
            console.log("Juego terminado");
            juegoActivo = false;
        }
    }

}

/////////////////////////////////
//MANEJO DE EVENTOS
/////////////////////////////////

function manageMouseDown(e) {

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    dx = mouseDownX - ball.bola_x;
    dy = mouseDownY - ball.bola_y;

    d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    if(d < ball.bola_radio * 4) {
        isClicked = true;

        ball.bola_vx = 0;
        ball.bola_vy = 0;

        bolaLanzada = false;
    }

}

function manageMouseUp(e) {

    if(bolaLanzada) return;
    if(!isClicked) return;

    ball.bola_vx = (mouseDownX - e.clientX) * factorLanzamiento;
    ball.bola_vy = (mouseDownY - e.clientY) * factorLanzamiento;

    isClicked = false;
    bolaLanzada = true;

}

function manageMouseMove(e) {
    mouseCurrentX = e.clientX;
    mouseCurrentY = e.clientY;
}   

requestAnimationFrame(gameLoop);
