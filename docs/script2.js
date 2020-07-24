window.onload = start;

function start() {
  const players = [
    {
      char: '&#10005;',
      className: 'playerX',
      id: 1,
    },
    {
      char: '&#9711;',
      className: 'playerY',
      id: 2,
    },
  ];

  const ticTacToe = new TicTacToe(3, players);

  const containerElement = document.getElementById('container');
  const turnText = document.getElementById('playerTurn');
  const resetButton = document.getElementById('reset');

  const ticTacToeBoard = ticTacToe.getBoard();
  containerElement.insertBefore(ticTacToeBoard, resetButton);

  Array.from(ticTacToeBoard.getElementsByTagName('td'))
    .forEach(
      (el) => el.addEventListener(
        'click',
        (e) => ticTacToe.selectCell(e.target)
      )
    );

  ticTacToe.addEvent(
    'turn',
    (player) => {
      turnText.innerHTML =
        'It\'s ' + (player['id'] === 1 ? 'Crew member 1' : 'Crew member 2') + '\'s turn.';
    }
  );

  ticTacToe.addEvent(
    'win',
    (player) => turnText.innerHTML =
      (player['id'] === 1 ? 'Crew member 1' : 'Crew member 2') + ' won the game.'
  );

  ticTacToe.addEvent(
    'draw',
    () => turnText.innerHTML = 'Game Over! It\'s a draw.'
  );

  resetButton.addEventListener( 'click', () => {
    ticTacToe.reset();
    turnText.innerHTML = ' Crew member 1 turn.';
  });
}
