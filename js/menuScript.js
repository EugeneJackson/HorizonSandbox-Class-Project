//Dibujo base del canvas
var c = document.getElementById("menuCanvas");
var ctx = c.getContext("2d");
//El canvas ocupa el tamaño completo de la ventana.
c.width = window.innerWidth;
c.height = window.innerHeight;

var starsArr = [];

for(var i = 0; i < 500; i++) {
    var estrella = {
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        radio: Math.random() * 1.5 + 0.5,
        vx: 0.2,
        vy: 0.1
    }

    starsArr.push(estrella);
}



function gameLoop() {

    ctx.clearRect(0, 0, c.width, c.height);
    dibujarEstrellas();
    requestAnimationFrame(gameLoop);
}

//Funcion para dibujar las estrellas moviendose en el Menu.
function dibujarEstrellas() {
    
    //recorremos el array de estrellas (starsArr) y pintamos cada estrella con el constructor que hicimos anteriormente.
    for(var i = 0; i < starsArr.length; i++) {
        ctx.fillStyle = "white";
        ctx.beginPath();

        ctx.arc(starsArr[i].x, starsArr[i].y, starsArr[i].radio, 0, 2 * Math.PI);
        ctx.fill();

        //Actualizamos cada frame la posicion x e y con la velocidad de x e y que hicimos en el constructor anteriormente.
        starsArr[i].x += starsArr[i].vx;
        starsArr[i].y += starsArr[i].vy;

        //Si las estrellas llegan al final de c.width se vuelven a pintar en la posicion 0 de x.
        if(starsArr[i].x > c.width) {
            starsArr[i].x = 0;
        }

        //Si las estrellas llegan al final de c.height se vuelven a pintar en la posicion 0 de y.
        if(starsArr[i].y > c.height) {
            starsArr[i].y = 0;
        }
    }

}

requestAnimationFrame(gameLoop)