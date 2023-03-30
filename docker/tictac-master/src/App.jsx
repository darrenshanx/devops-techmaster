import { useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Square({ value, onSquareClick, isWon }) {
  return (
    <Col className={"square" + isWon} as="button" onClick={onSquareClick}>
      {value}
    </Col>
  );
}

function declareWinner(squares) {
  let moves = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < 8; ++i) {
    const [a, b, c] = moves[i];
    if (squares[a] && squares[a] == squares[b] && squares[a] == squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}

function makeBoard(squares, handleClick, won) {
  let board1 = [];
  for (let i = 0; i < 3; ++i) {
    let tmp = [];
    for (let j = 0; j < 3; ++j) {
      let cl = "";
      if (won != null) {
        cl =
          i * 3 + j == won[0] || i * 3 + j == won[1] || i * 3 + j == won[2]
            ? " isWin"
            : "";
      }
      tmp.push(
        <Square
          key={i * 3 + j}
          value={squares[i * 3 + j]}
          onSquareClick={() => handleClick(i * 3 + j)}
          isWon={cl}
        />
      );
    }
    board1.push(<Row key={i}>{tmp}</Row>);
  }
  return board1;
}

function makeMoves(history, jumpTo, order) {
  let tmp = history.map((e, i) => {
    let desc = "";
    let move = "";
    let variant = "info";
    if (i == 0) {
      desc = "Go to start Game";
      variant = "danger";
    } else {
      desc = "Go to move #" + i;
      move =
        "The move was " + e[1][0] + " on (" + e[1][1] + "," + e[1][2] + ")";
    }
    if (i == history.length - 1) {
      variant = "primary";
    }
    return (
      <ListGroup.Item
        action
        variant={variant}
        key={i}
        onClick={() => jumpTo(i)}
      >
        <span>
          {desc}
          {i != 0 ? <p className="description">{move}</p> : <></>}
        </span>
      </ListGroup.Item>
    );
  });
  if (order) return tmp.reverse();
  return tmp;
}

function Board({ move, nextState, onPlay }) {
  let squares = move[0];
  const winner = declareWinner(squares);
  let status;
  let isWin = "";

  if (winner) {
    status = "Winner " + squares[winner[0]];
    isWin = " isWin";
  } else if (squares.every((e) => e == "X" || e == "O")) {
    status = "Draw Game";
    isWin = " isDraw";
  } else {
    status = "Move to " + (nextState ? "X" : "O");
  }

  function handleClick(i) {
    if (squares[i] || winner) {
      return;
    }

    const nextSquare = [
      squares.slice(),
      [0, (i % 3) + 1, Math.floor(i / 3) + 1],
    ];
    if (nextState) {
      nextSquare[0][i] = nextSquare[1][0] = "X";
    } else {
      nextSquare[0][i] = nextSquare[1][0] = "O";
    }
    console.log({ nextSquare });
    onPlay(nextSquare);
  }

  return (
    <>
      <div className={"status" + isWin}>{status}</div>
      {makeBoard(squares, handleClick, winner)}
    </>
  );
}

export default function Game() {
  const [currentMove, setCurrentMove] = useState(0);
  const [history, setHistory] = useState([
    [Array(9).fill(null), Array(3).fill(0)],
  ]);
  const nextState = currentMove % 2 === 0;
  const [order, setOrder] = useState(0);

  let moves = makeMoves(history, jumpTo, order);

  function handleSort() {
    setOrder(!order);
    moves = makeMoves(history, jumpTo, order);
  }

  function handlePlay(nextSquare) {
    setHistory([...history.slice(0, currentMove + 1), nextSquare]);
    setCurrentMove(currentMove + 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  //console.log({ total: history, uno: history[0] });
  return (
    <Container className="my-3">
      <Row className="justify-content-center">
        <Col xs={11} sm={12} md={5} className="mb-3">
          <Board
            move={history[currentMove]}
            nextState={nextState}
            onPlay={handlePlay}
          />
        </Col>
        <Col xs={11} sm={12} md={5}>
          <Row className="justify-content-center">
            <Col
              xs={4}
              md={9}
              className="my-md-2 d-flex justify-content-center "
            >
              <Button variant="success" onClick={handleSort}>
                {order == 0 ? "Sort moves descending" : "Sort moves ascending"}
              </Button>
            </Col>
            <Col xs={7} md={12}>
              <ListGroup variant="flush">{moves}</ListGroup>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
