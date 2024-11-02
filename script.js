document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const turnIndicator = document.getElementById('turn-indicator');
  const captureSound = document.getElementById('capture-sound');
  const kingSound = document.getElementById('king-sound');
  const winSound = document.getElementById('win-sound');

  let turn = 'white';
  const size = 8;
  let selectedTile = null;

  // Function to play sound for a limited duration
  function playSound(soundElement) {
    soundElement.currentTime = 0;  // Start from the beginning
    soundElement.play();
    
    // Stop sound after 2 seconds
    setTimeout(() => {
      soundElement.pause();
      soundElement.currentTime = 0;  // Reset to start
    }, 2000);
  }

  function createBoard() {
    board.innerHTML = ''; // Clear existing board

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tile = document.createElement('div');
        tile.classList.add('tile', (row + col) % 2 === 0 ? 'white' : 'black');
        tile.dataset.row = row;
        tile.dataset.col = col;

        // Place initial pieces
        if (tile.classList.contains('black') && (row < 3 || row > 4)) {
          const piece = document.createElement('div');
          piece.classList.add('piece', row < 3 ? 'black' : 'white');
          tile.appendChild(piece);
        }

        tile.addEventListener('click', () => handleTileClick(tile));
        board.appendChild(tile);
      }
    }
  }

  function handleTileClick(tile) {
    const selectedPiece = tile.querySelector('.piece');
    if (selectedPiece && selectedPiece.classList.contains(turn)) {
      selectPiece(tile, selectedPiece);
    } else if (tile.classList.contains('highlight')) {
      movePieceToTile(tile);
    }
  }

  function selectPiece(tile, piece) {
    clearHighlights();
    selectedTile = tile;
    highlightMoves(tile, piece);
  }

  function highlightMoves(tile, piece) {
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);
    const isKing = piece.classList.contains('king');

    const directions = getMoveDirections(isKing);

    directions.forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      const captureRow = row + 2 * dr;
      const captureCol = col + 2 * dc;

      const targetTile = document.querySelector(`.tile[data-row="${newRow}"][data-col="${newCol}"]`);
      const captureTile = document.querySelector(`.tile[data-row="${captureRow}"][data-col="${captureCol}"]`);

      if (isValidMove(newRow, newCol) && targetTile && !targetTile.querySelector('.piece')) {
        targetTile.classList.add('highlight'); // Highlight valid move
      } else if (
        isValidMove(captureRow, captureCol) &&
        targetTile?.querySelector(`.piece:not(.${turn})`) &&
        captureTile && !captureTile.querySelector('.piece')
      ) {
        captureTile.classList.add('highlight');
        captureTile.dataset.capture = `${newRow},${newCol}`; // Mark for capturing
      }
    });
  }

  function getMoveDirections(isKing) {
    if (isKing) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return turn === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  }

  function isValidMove(row, col) {
    return row >= 0 && row < size && col >= 0 && col < size;
  }

  function movePieceToTile(targetTile) {
    if (!selectedTile) return;

    const piece = selectedTile.querySelector('.piece');
    targetTile.appendChild(piece);

    // Handle capturing
    if (targetTile.dataset.capture) {
      const [captureRow, captureCol] = targetTile.dataset.capture.split(',').map(Number);
      const captureTile = document.querySelector(`.tile[data-row="${captureRow}"][data-col="${captureCol}"]`);
      captureTile.querySelector('.piece').remove(); // Remove captured piece
      playSound(captureSound); // Play capture sound
      delete targetTile.dataset.capture;
    }

    // Check for kinging
    const row = parseInt(targetTile.dataset.row);
    if ((turn === 'white' && row === 0) || (turn === 'black' && row === size - 1)) {
      makeKing(piece);
    }

    clearHighlights();
    checkForWin();
    switchTurn();
  }

  function makeKing(piece) {
    piece.classList.add('king');
    piece.innerHTML = '👑'; // Adds king icon
    playSound(kingSound); // Play kinging sound
  }

  function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(tile => {
      tile.classList.remove('highlight');
      delete tile.dataset.capture;
    });
    selectedTile = null;
  }

  function switchTurn() {
    turn = turn === 'white' ? 'black' : 'white';
    turnIndicator.textContent = `${turn === 'white' ? "Player 1's Turn (White)" : "Player 2's Turn (Black)"}`;
  }

  function checkForWin() {
    const blackPieces = document.querySelectorAll('.piece.black').length;
    const whitePieces = document.querySelectorAll('.piece.white').length;

    if (blackPieces === 0) {
      alert("Player 1 (White) Wins!");
      playSound(winSound);
      resetGame();
    } else if (whitePieces === 0) {
      alert("Player 2 (Black) Wins!");
      playSound(winSound);
      resetGame();
    }
  }

  function resetGame() {
    setTimeout(createBoard, 1000);
  }

  createBoard();
});
