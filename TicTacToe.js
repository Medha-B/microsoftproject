const TicTacToe = (function() {
  // returns the index of an element within its parent
  const elementIndex = function elementIndex(elem) {
    return Array.from( elem.parentNode.children ).indexOf(elem);
  };

  const mapFunctionToAsync = function mapFunctionToAsync(func) {
    return function(...args) {
      setTimeout( func, 0, ...args );
    };
  };

  const checkMovesHasCombination =
    function checkMovesHasCombination(moves, combination) {
      return combination.every((num) => moves.includes(num));
    };

  /* returns the winning combinations for the specified table-size in a
  2d array. */
  const getWinningCombinations = function getWinningCombinations(size) {
    const combinations = [];
    const diagonalCombinations = [[], []];
    for (let i = 0; i < size; i++) {
      diagonalCombinations[0].push( i + (i * size) );
      diagonalCombinations[1].push( (size - 1 - i) + (i * size) );
      const horizontalCombination = [];
      const verticalCombination = [];
      for (let a = 0; a < size; a++) {
        horizontalCombination.push( a + (i * size) );
        verticalCombination.push( i + (a * size) );
      }
      combinations.push(horizontalCombination, verticalCombination);
    }
    combinations.push( diagonalCombinations[0], diagonalCombinations[1] );
    return combinations;
  };

  // generates an HTML table of the specified size (size X size)
  const generateTable = function generateTable(size) {
    const table = document.createElement('table');
    for ( let i = 0; i < size; i++ ) {
      const tr = table.appendChild( document.createElement('tr') );
      for ( let a = 0; a < size; a++ ) {
        tr.appendChild( document.createElement('td') );
      }
    }
    return table;
  };

  const mapPlayer = function mapPlayer(player) {
    const playerCopy = Object.assign(player);
    playerCopy.moves = [];
    return playerCopy;
  };

  const getCellNum = function getCellNum(elem) {
    return elementIndex(elem) + (
      elementIndex(elem.parentNode) * elem.parentNode.children.length
    );
  };

  const Cell = function Cell(elem) {
    this.elem = elem;
    this.num = getCellNum(elem);
    this.player = null;
  };

  Cell.prototype.select = function select(player) {
    // if not empty, return 'false'.
    if (this.player) {
      return false;
    }
    this.player = player;
    this.elem.innerHTML = this.player.char;
    if ( this.player.className ) {
      this.elem.classList.add( this.player.className );
    }
    return true;
  };

  Cell.prototype.clear = function clear() {
    // if already empty, return.
    if (!this.player) {
      return false;
    }
    this.elem.innerHTML = '';
    if ( this.player.className ) {
      this.elem.classList.remove( this.player.className );
    }
    this.player = null;
    return true;
  };

  /*
  * 'size': an integer representing the number of both the columns and rows of
  * the game grid.
  * 'players': an object that has a 'char' (specifying the symbol to mark cells
  * with for the player) and an optional 'className' property (specifying the
  * className to be added to cells occupied by a player).
  */
  const TicTacToe = function TicTacToe(theSize, thePlayers) {
    if ( !Number.isInteger(theSize) ) {
      throw Error('Invalid arguments passed! Please see the documentation.');
    } else if ( !Array.isArray(thePlayers) || !thePlayers.length >= 2 ) {
      throw Error('Invalid arguments passed! Please see the documentation.');
    } else {
      thePlayers.forEach( (player) => {
        if ( !(typeof player.char === 'string') ) {
          throw Error(
            'Invalid arguments passed! Please see the documentation.'
          );
        }
      } );
    }

    // public API object
    const TicTacToeAPI = {};

    const size = theSize;
    let players = thePlayers.map( (player) => mapPlayer(player) );
    const playersInitial = players.slice();
    const winningCombinations = getWinningCombinations(size);
    let gameResolved = false;
    const table = generateTable(size);
    const cells = Array.from( table.getElementsByTagName('td') )
      .map( (elem) => new Cell(elem) );

    const eventListeners = {
      'select': null,
      'turn': null,
      'win': null,
      'draw': null,
    };

    for ( let key in eventListeners ) {
      if ( eventListeners.hasOwnProperty(key) ) {
        let handler = eventListeners[key];
        Object.defineProperty(eventListeners, key, {
          get() {
            return handler;
          },
          set(newHandler) {
            /* The handlers should be called asynchronously so they don't
              break our code in case they throw an exception */
            handler = mapFunctionToAsync( newHandler );
          },
          enumerable: true,
        });
      }
    }

    /* checks if a player has won, if they have, it returns that player's
      object. */
    const checkForWin = function checkForWin() {
      return players.find(
        (player) => winningCombinations.some(
          (combination) => checkMovesHasCombination(
            player.moves, combination
          )
        )
      );
    };

    /* checks if the game is a draw (draw == all cells occupied && no one
      has won) */
    const checkForDraw = function checkForDraw() {
      return cells.every( (cell) => cell.player ) && !checkForWin();
    };

    const resolveGame = function resolveGame() {
      const winner = checkForWin();
      if ( winner && typeof eventListeners['win'] === 'function' ) {
        eventListeners['win'](winner);
      } else if ( checkForDraw() && typeof eventListeners['draw'] === 'function' ) {
        eventListeners['draw']();
      } else {
        return;
      }
      gameResolved = true;
    };

    const handlePlayerTurns = function handlePlayerTurns() {
      players.push( players.shift() );
      if ( typeof eventListeners['turn'] === 'function' && !gameResolved === true ) {
        eventListeners['turn'](players[0]);
      }
      return players[0];
    };

    TicTacToeAPI.selectCell = function selectCell(elem) {
      if ( gameResolved === true ) {
        return;
      }
      const cell = cells.find( (cell) => cell.elem === elem );
      if ( cell && cell.select(players[0]) ) {
        players[0].moves.push( cell.num );
        resolveGame();
        if ( typeof eventListeners['select'] === 'function' ) {
          eventListeners['select'](players[0]);
        }
        handlePlayerTurns();
      }
    };

    TicTacToeAPI.getBoard = function getBoard() {
      return table;
    };

    TicTacToeAPI.reset = function reset() {
      cells.forEach((cell) => cell.clear());
      players = playersInitial.map(
        (player) => mapPlayer(player)
      );
      gameResolved = false;
    };

    TicTacToeAPI.addEvent = function addEvent(eventName, listener) {
      if ( eventListeners.hasOwnProperty(eventName) && typeof listener === 'function') {
        eventListeners[eventName] = listener;
      }
    };

    return TicTacToeAPI;
  };

  return TicTacToe;
})();
