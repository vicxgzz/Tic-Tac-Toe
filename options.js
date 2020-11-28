
const opciones = document.querySelector(".options");
const xBtn = document.querySelector(".x");
const oBtn = document.querySelector(".o");
const juegaBtn = document.querySelector(".play");

const juegoPerdidoElemento = document.querySelector(".gameover");

const player = new Object;
let OPPONENT = "computer";

oBtn.addEventListener("click", function(){
    player.man = "O";
    player.computer = "X";
    
});

xBtn.addEventListener("click", function(){
    player.man = "X";
    player.computer = "O";
});
 


juegaBtn.addEventListener("click", function(){
    if( !player.man ){
        oBtn.style.backgroundColor = "red";
        xBtn.style.backgroundColor = "red";
        return;
    }
    
    init(player, OPPONENT);
    opciones.classList.add("hide");
});

