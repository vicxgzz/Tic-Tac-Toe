function init(player, OPPONENT){
    // seleccionamos el canvas a dibujar e inicializamos variables
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");
        let board = [];
    const COLUMN = 3;
    const ROW = 3;
    const SPACE_SIZE = 150;
    
    
    let gameData = new Array(9);
        // el primer en tirar es el usuario
    let currentPlayer = player.man;
    // carga imagenes para x y o
    const xImage = new Image();
    xImage.src = "img/X.png";

    const oImage = new Image();
    oImage.src = "img/O.png";
    // combinaciones para ganar
    const COMBOS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    //bandera para el juego terminado
    let GAME_OVER = false;
    // almacena movimientos del jugador
    
    // Dibujado de la tabla
    function drawBoard(){
        // Damos a cada espacio una identificación única
        // sabemos exactamente dónde poner el movimiento del jugador en el juego.
        let id = 0
        for(let i = 0; i < ROW; i++){
            board[i] = [];
            for(let j = 0; j < COLUMN; j++){
                board[i][j] = id;
                id++;
                ctx.strokeStyle = "#000";
                ctx.strokeRect(j * SPACE_SIZE, i * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
            }
        }
    }
    drawBoard();

    
    canvas.addEventListener("click", function(event){
        
        //SI ES UN JUEGO TERMINADO? SALIDA
        if(GAME_OVER) return;

        // Posición X e Y del clic del mouse en relación con el canvas
        let X = event.clientX - canvas.getBoundingClientRect().x;
        let Y = event.clientY - canvas.getBoundingClientRect().y;

        // se calcula el espacio al dar clic
        let i = Math.floor(Y/SPACE_SIZE);
        let j = Math.floor(X/SPACE_SIZE);

        // se obtiene el id en el espacio donde se dio clic
        let id = board[i][j];

        // evita seleccionar la misma casilla
        if(gameData[id]) return;

        // almacena el movimiento del jugador en gameData
        gameData[id] = currentPlayer;
        
        // dibuja el moviento en la tabla
        drawOnBoard(currentPlayer, i, j);//funcion del estado inicial

        // Comprueba si la jugada gana
        if(isWinner(gameData, currentPlayer)){
            showGameOver(currentPlayer);
            GAME_OVER = true;
            return;
        }

        // o empate
        if(isTie(gameData)){
            showGameOver("tie");
            GAME_OVER = true;
            return;
        }

        if( OPPONENT == "computer"){
            // obtener la identificación del espacio usando el algoritmo minimax
            let id = minimax( gameData, player.computer ).id;

            // almacenar el movimiento del jugador en gameData
            gameData[id] = player.computer;
            
            // obtener i y j del espacio
            let space = getIJ(id);

            // dibuja el movimiento en la tabla
            drawOnBoard(player.computer, space.i, space.j);

            // otra vez comprueba si la jugada gana
            if(isWinner(gameData, player.computer)){
                showGameOver(player.computer);
                GAME_OVER = true;
                return;
            }

            // co si hay empate
            if(isTie(gameData)){
                showGameOver("tie");
                GAME_OVER = true;
                return;
            }
        }else{
            // se le da turno al jugador
            currentPlayer = currentPlayer == player.man ? player.friend : player.man;
        }

    });

    // MINIMAX
    function minimax(gameData, PLAYER){
        // BASE
        if( isWinner(gameData, player.computer) ) return { evaluation : +10 };
        if( isWinner(gameData, player.man)      ) return { evaluation : -10 };
        if( isTie(gameData)                     ) return { evaluation : 0 };

        // BUSCA ESPACIOS VACÍOS
        let EMPTY_SPACES = getEmptySpaces(gameData);

        // GUARDA TODOS LOS MOVIMIENTOS Y SUS EVALUACIONES
        let moves = [];

        // con el for recorre sobre los espacios vacíos para evaluarlos
        for( let i = 0; i < EMPTY_SPACES.length; i++){
            // obtiene el id del espacio vacio
            let id = EMPTY_SPACES[i];

            // RESPALDA EL ESPACIO
            let backup = gameData[id];

            // hace movimiento para el jugador
            gameData[id] = PLAYER;

            // guarda el id y su evaluacion
            let move = {};
            move.id = id;
            // hace la evaluacion del movimiento
            if( PLAYER == player.computer){
                move.evaluation = minimax(gameData, player.man).evaluation;
            }else{
                move.evaluation = minimax(gameData, player.computer).evaluation;
            }

            //  RESTAURAR ESPACIO
            gameData[id] = backup;

            // guardo move a moves del array
            moves.push(move);
        }

        // MINIMAX 
        let bestMove;

        if(PLAYER == player.computer){
            // MAXIMIZADOR
            let bestEvaluation = -Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation > bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }else{
            // MINIMIZADOR
            let bestEvaluation = +Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation < bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }

        return bestMove;
    }

    // consigue los espacios vacios
    function getEmptySpaces(gameData){
        let EMPTY = [];

        for( let id = 0; id < gameData.length; id++){
            if(!gameData[id]) EMPTY.push(id);
        }

        return EMPTY;
    }

    // obtiene a i, j de un espacio
    function getIJ(id){
        for(let i = 0; i < board.length; i++){
            for(let j = 0; j < board[i].length; j++){
                if(board[i][j] == id) return { i : i, j : j}
            }
        }
    }

    // busca un ganador
    function isWinner(gameData, player){
        for(let i = 0; i < COMBOS.length; i++){
            let won = true;

            for(let j = 0; j < COMBOS[i].length; j++){
                let id = COMBOS[i][j];
                won = gameData[id] == player && won;
            }

            if(won){
                return true;
            }
        }
        return false;
    }

    // busca un empate
    function isTie(gameData){
        let isBoardFill = true;
        for(let i = 0; i < gameData.length; i++){
            isBoardFill = gameData[i] && isBoardFill;
        }
        if(isBoardFill){
            return true;
        }
        return false;
    }

    // imprime
    function showGameOver(player){
        let message = player == "empate" ? "no ganaste" : "el ganador es";
        let imgSrc = `img/${player}.png`;

        juegoPerdidoElemento.innerHTML = `
            <h1>${message}</1>
            <img class="winner-img" src=${imgSrc} </img>
            <div class="play" onclick="location.reload()">jugar de nuevo</div>
        `;

        juegoPerdidoElemento.classList.remove("hide");
    }

    // dibuja en la tabla
    function drawOnBoard(player, i, j){
        let img = player == "X" ? xImage : oImage;

        
        ctx.drawImage(img, j * SPACE_SIZE, i * SPACE_SIZE);
    }
}
