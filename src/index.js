import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.isWinningSquare ? 'square winning-square' : 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        isWinningSquare={this.props.winningSquares.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const elements = [];
    for (let row = 0; row < 3; row++) {
      const cols = [];
      for (let col = 0; col < 3; col++) {
        cols.push(this.renderSquare(row * 3 + col));
      }
      elements.push(<div key={row} className="board-row">{cols}</div>);
    }
    return (
      <div>{elements}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      sortIsAsc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState((prevState) => ({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !prevState.xIsNext,
    }));
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  toggleOrder() {
    this.setState((prevState) => ({
      sortIsAsc: !prevState.sortIsAsc,
    }));
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const { winner, winningSquares } = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={this.state.stepNumber === move ? 'current-move' : ''}
          >
            {desc}{getLastMove(history, move)}
          </button>
        </li>
      );
    });

    if (!this.state.sortIsAsc) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber < 9) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'It\'s a draw!';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleOrder()}>{'Toggle order to ' + (this.state.sortIsAsc ? 'descending': 'ascending')}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: lines[i],
      };
    }
  }
  return { 
    winner: null,
    winningSquares: [],
  };
}

function getLastMove(history, move) {
  if (move < 1) {
    return '';
  }
  const lastMoveIndex = history[move].squares.findIndex((elem, idx) => elem !== history[move - 1].squares[idx]);
  const col = lastMoveIndex % 3;
  const row = (lastMoveIndex - col) / 3;
  return ' (' + (col + 1) + ', ' + (row + 1) + ')';
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
