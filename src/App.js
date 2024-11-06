import React, { useState, useEffect } from "react";
import './App.css';

const generateRandomNumbers = (count) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
};

const getRandomPosition = (maxWidth, maxHeight, radius, positions) => {
  const maxAttempts = 100;
  let attempt = 0;
  let position;

  while (attempt < maxAttempts) {
    const x = Math.floor(Math.random() * (maxWidth - 2 * radius));
    const y = Math.floor(Math.random() * (maxHeight - 2 * radius));
    position = { x, y };

    let overlap = false;
    for (let pos of positions) {
      const distance = Math.sqrt(
        (x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y)
      );
      if (distance < 2 * radius) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      return position;
    }

    attempt++;
  }

  return position;
};

const Game = () => {
  const [numberCount, setNumberCount] = useState(5);
  const [targetCount, setTargetCount] = useState(5);
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [positions, setPositions] = useState([]);
  const [clickedNumbers, setClickedNumbers] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [inputValue, setInputValue] = useState(5);
  const [countdown, setCountdown] = useState({});
  const [hiddenNumbers, setHiddenNumbers] = useState(new Set());
  const [autoPlay, setAutoPlay] = useState(false);

  const startGame = () => {
    const numbers = generateRandomNumbers(numberCount);
    setRandomNumbers(numbers);
    setCurrentNumber(1);
    setMessage("");
    setGameStarted(true);
    setClickedNumbers([]);
    setElapsedTime(0);
    setHiddenNumbers(new Set());

    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 0.1);
    }, 100);
    setTimerInterval(interval);

    const newPositions = [];
    const radius = 25;
    for (let i = 0; i < targetCount; i++) {
      const newPosition = getRandomPosition(500, 400, radius, newPositions);
      newPositions.push(newPosition);
    }
    setPositions(newPositions);
  };

  const autoPlayGame = () => {
    if (autoPlay && gameStarted && currentNumber <= targetCount) {
      const interval = setInterval(() => {
        if (currentNumber <= targetCount) {
          handleClick(currentNumber);
        } else {
          clearInterval(interval);
          setMessage(`Congratulations! You have found all the numbers. Completion time: ${elapsedTime.toFixed(1)} seconds.`);
          setGameStarted(false);
          setAutoPlay(false);
          if (timerInterval) clearInterval(timerInterval);
        }
      }, 1000);
      return interval;
    }
    return null;
  };

  useEffect(() => {
    const interval = autoPlayGame();
    return () => clearInterval(interval);
  }, [autoPlay, gameStarted, currentNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdowns) => {
        const updatedCountdowns = {};
        const newHiddenNumbers = new Set(hiddenNumbers);

        Object.keys(prevCountdowns).forEach((key) => {
          const newValue = prevCountdowns[key] - 0.1;
          if (newValue > 0) {
            updatedCountdowns[key] = parseFloat(newValue.toFixed(1));
          } else {
            newHiddenNumbers.add(parseInt(key));
          }
        });

        setHiddenNumbers(newHiddenNumbers);
        return updatedCountdowns;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hiddenNumbers]);


  const resetGame = () => {
    setRandomNumbers([]);
    setCurrentNumber(1);
    setMessage("");
    setGameStarted(false);
    setPositions([]);
    setClickedNumbers([]);
    setElapsedTime(0);
    setHiddenNumbers(new Set());
    setCountdown({});
    setAutoPlay(false);
    if (timerInterval) clearInterval(timerInterval);
  };
  const handleRestart = () => {
    resetGame();
    startGame();
  };
  const handleClick = (number) => {
    if (!gameStarted) return;

    if (number === currentNumber) {
      setCurrentNumber((prev) => prev + 1);
      setClickedNumbers((prevClicked) => [...prevClicked, number]);

      setCountdown((prevCountdowns) => ({
        ...prevCountdowns,
        [number]: 3.0,
      }));
    } else {
      setMessage("Game Over");
      setGameStarted(false);
      setAutoPlay(false);
      if (timerInterval) clearInterval(timerInterval);
    }
  };

  useEffect(() => {
    if (hiddenNumbers.size === targetCount) {
      setMessage(`Congratulations! You have found all the numbers. Completion time: ${elapsedTime.toFixed(1)} seconds.`);
      setGameStarted(false);
      setAutoPlay(false);
      if (timerInterval) clearInterval(timerInterval);
    }
  }, [currentNumber, targetCount, elapsedTime, timerInterval]);

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    setInputValue(value);
    setNumberCount(value);
    setTargetCount(value);
  };

  let headerStyle = { color: "black" };
  let headerText = "LET'S PLAY";

  if (!gameStarted) {
    if (message === "Game Over") {
      headerStyle = { color: "red" };
      headerText = "GAME OVER";
    } else if (currentNumber > targetCount) {
      headerStyle = { color: "green" };
      headerText = "ALL CLEARED";
    }
  } else if (gameStarted) {
    headerText = "LET'S PLAY";
  }

  return (
    <div className="container">
      <h1 style={headerStyle}>{headerText}</h1>
      <div className="container__title">
        <div style={{ display: "flex", gap: "5px" }}>
          <p>
            Point:

          </p>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min="1"
            max="1000"
            style={{ width: "200px" }}
          />
        </div>
        <div>
          <p>{message}</p>
          <p>Time: {elapsedTime.toFixed(1)} s</p>

        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={gameStarted ? handleRestart : startGame}
            disabled={gameStarted && message === "Game Over"}
          >
            {gameStarted ? "Restart" : "Play"}
          </button>
          <button onClick={() => setAutoPlay(!autoPlay)} disabled={!gameStarted}>
            {autoPlay ? "Auto Play OFF" : "Auto Play ON"}
          </button>
        </div>

      </div>
      <div className="container__AreaGame">
        {randomNumbers.map((number, index) => (
          !hiddenNumbers.has(number) && (
            <div
              className="container__btn"
              key={number}
              onClick={() => handleClick(number)}
              style={{
                position: "absolute",
                left: `${positions[index]?.x || 0}px`,
                top: `${positions[index]?.y || 0}px`,
                width: "50px",
                height: "50px",
                backgroundColor: clickedNumbers.includes(number) ? "#FF0000" : "#FFFFFF",
                color: "black",
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: gameStarted ? "pointer" : "default",
                fontSize: "20px",
                border: "1px solid #000",
                pointerEvents: hiddenNumbers.has(number) ? "none" : "auto",
                transition: "opacity 1s ease",
                opacity: countdown[number] ? countdown[number] / 3 : 1,
                zIndex: numberCount - number

              }}
            >
              {number}
              {countdown[number] && (
                <span style={{ fontSize: "10px", color: "#fff" }}>
                  {countdown[number].toFixed(1)}
                </span>
              )}
            </div>
          )
        ))}
      </div>
      <div style={{ height: "50px" }}>
        {gameStarted && currentNumber <= targetCount && (
          <p>Next: {currentNumber}</p>
        )}
      </div>
    </div>
  );
};

export default Game;
