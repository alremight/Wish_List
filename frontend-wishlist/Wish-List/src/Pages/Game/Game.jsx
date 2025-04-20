// import React, { useState, useEffect, useRef } from 'react';

// const  Game = () => {
//     // Game state variables
//     const [gameStarted, setGameStarted] = useState(false);
//     const [gameOver, setGameOver] = useState(false);
//     const [score, setScore] = useState(0);
//     const [lives, setLives] = useState(3);
//     const [playerPosition, setPlayerPosition] = useState(50);
//     const [fallingObjects, setFallingObjects] = useState([]);
//     const [gameSpeed, setGameSpeed] = useState(10);
//     const [lastObjectTime, setLastObjectTime] = useState(0);
  
//     // Game area dimensions
//     const gameWidth = 400;
//     const gameHeight = 500;
//     const playerWidth = 60;
//     const playerHeight = 40;
//     const objectSize = 30;
  
//     // Animation frame reference
//     const requestRef = useRef();
    
//     // Function to handle keyboard/mouse input
//     const handleInput = (e) => {
//       // Handle keyboard movement
//       if (e.type === 'keydown') {
//         if (e.key === 'ArrowLeft' || e.key === 'a') {
//           setPlayerPosition(prev => Math.max(0, prev - 5));
//         } else if (e.key === 'ArrowRight' || e.key === 'd') {
//           setPlayerPosition(prev => Math.min(100, prev + 5));
//         }
//       } 
//       // Handle mouse/touch movement
//       else if (e.type === 'mousemove' || e.type === 'touchmove') {
//         const gameArea = document.getElementById('game-area');
//         if (!gameArea) return;
        
//         const rect = gameArea.getBoundingClientRect();
//         let clientX;
        
//         if (e.type === 'touchmove') {
//           clientX = e.touches[0].clientX;
//         } else {
//           clientX = e.clientX;
//         }
        
//         const relativeX = clientX - rect.left;
//         const percentX = (relativeX / rect.width) * 100;
        
//         setPlayerPosition(Math.max(0, Math.min(100, percentX)));
//       }
//     };
  
//     // Start the game
//     const startGame = () => {
//       setGameStarted(true);
//       setGameOver(false);
//       setScore(0);
//       setLives(3);
//       setFallingObjects([]);
//       setGameSpeed(10);
//     };
  
//     // Game loop
//     const gameLoop = (timestamp) => {
//       if (!gameStarted || gameOver) return;
      
//       // Create new objects occasionally
//       if (timestamp - lastObjectTime > 1000) {
//         const newObject = {
//           id: Date.now(),
//           x: Math.random() * (100 - objectSize / (gameWidth / 100)),
//           y: 0,
//           type: Math.random() > 0.3 ? 'good' : 'bad',
//         };
        
//         setFallingObjects(prev => [...prev, newObject]);
//         setLastObjectTime(timestamp);
//       }
      
//       // Move all objects down
//       setFallingObjects(prevObjects => {
//         const updatedObjects = prevObjects.map(obj => ({
//           ...obj,
//           y: obj.y + gameSpeed * 0.05
//         }));
        
//         // Check for collisions and objects going off-screen
//         let updatedLives = lives;
//         let updatedScore = score;
        
//         const remainingObjects = updatedObjects.filter(obj => {
//           // Object is still within the game area
//           if (obj.y < 100) {
//             return true;
//           }
          
//           // Object reached the bottom
//           // Check if player caught it
//           const playerLeft = playerPosition;
//           const playerRight = playerPosition + playerWidth / (gameWidth / 100);
//           const objectLeft = obj.x;
//           const objectRight = obj.x + objectSize / (gameWidth / 100);
          
//           if (
//             objectRight >= playerLeft && 
//             objectLeft <= playerRight && 
//             obj.y >= 90 && 
//             obj.y <= 100
//           ) {
//             // Player caught the object
//             if (obj.type === 'good') {
//               updatedScore += 10;
//             } else {
//               updatedLives -= 1;
//             }
//           } else if (obj.type === 'good') {
//             // Player missed a good object
//             updatedLives -= 1;
//           }
          
//           return false;
//         });
        
//         // Update game state
//         if (updatedLives !== lives) {
//           setLives(updatedLives);
//           if (updatedLives <= 0) {
//             setGameOver(true);
//           }
//         }
        
//         if (updatedScore !== score) {
//           setScore(updatedScore);
//           // Increase game speed every 50 points
//           if (Math.floor(updatedScore / 50) > Math.floor(score / 50)) {
//             setGameSpeed(prev => prev + 2);
//           }
//         }
        
//         return remainingObjects;
//       });
      
//       requestRef.current = requestAnimationFrame(gameLoop);
//     };
  
//     // Set up and clean up game loop
//     useEffect(() => {
//       if (gameStarted && !gameOver) {
//         requestRef.current = requestAnimationFrame(gameLoop);
//       }
      
//       return () => {
//         if (requestRef.current) {
//           cancelAnimationFrame(requestRef.current);
//         }
//       };
//     }, [gameStarted, gameOver, score, lives, playerPosition, lastObjectTime]);
    
//     // Set up input event listeners
//     useEffect(() => {
//       if (gameStarted && !gameOver) {
//         window.addEventListener('keydown', handleInput);
//         window.addEventListener('mousemove', handleInput);
//         window.addEventListener('touchmove', handleInput);
//       }
      
//       return () => {
//         window.removeEventListener('keydown', handleInput);
//         window.removeEventListener('mousemove', handleInput);
//         window.removeEventListener('touchmove', handleInput);
//       };
//     }, [gameStarted, gameOver]);
  
//     return (
//       <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800 text-white p-4">
//         <h1 className="text-2xl font-bold mb-4">Fruit Catcher</h1>
        
//         <div 
//           id="game-area"
//           className="relative w-full max-w-md h-96 bg-blue-900 border-2 border-blue-400 rounded-lg overflow-hidden"
//           style={{ height: gameHeight + 'px', width: gameWidth + 'px' }}
//         >
//           {/* Sky background with clouds */}
//           <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600">
//             <div className="absolute top-10 left-20 w-16 h-6 bg-white rounded-full" />
//             <div className="absolute top-20 left-80 w-24 h-8 bg-white rounded-full" />
//             <div className="absolute top-40 left-40 w-20 h-7 bg-white rounded-full" />
//           </div>
          
//           {/* Game objects */}
//           {gameStarted && !gameOver && (
//             <>
//               {/* Falling objects */}
//               {fallingObjects.map(obj => (
//                 <div
//                   key={obj.id}
//                   className={`absolute rounded-full ${obj.type === 'good' ? 'bg-red-500' : 'bg-gray-700'}`}
//                   style={{
//                     left: `${obj.x}%`,
//                     top: `${obj.y}%`,
//                     width: `${objectSize}px`,
//                     height: `${objectSize}px`,
//                   }}
//                 />
//               ))}
              
//               {/* Player basket */}
//               <div
//                 className="absolute bottom-0 bg-yellow-700"
//                 style={{
//                   left: `${playerPosition}%`,
//                   width: `${playerWidth}px`,
//                   height: `${playerHeight}px`,
//                   borderTopLeftRadius: '50%',
//                   borderTopRightRadius: '50%',
//                   borderBottomLeftRadius: '0',
//                   borderBottomRightRadius: '0',
//                 }}
//               >
//                 <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-yellow-600" />
//               </div>
//             </>
//           )}
          
//           {/* Start screen */}
//           {!gameStarted && !gameOver && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
//               <h2 className="text-xl font-bold mb-4">Catch The Fruits!</h2>
//               <p className="mb-2">Catch red fruits, avoid gray rocks</p>
//               <p className="mb-4">Use arrow keys or mouse to move</p>
//               <button
//                 className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
//                 onClick={startGame}
//               >
//                 Start Game
//               </button>
//             </div>
//           )}
          
//           {/* Game over screen */}
//           {gameOver && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
//               <h2 className="text-xl font-bold mb-4">Game Over!</h2>
//               <p className="mb-4">Your score: {score}</p>
//               <button
//                 className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
//                 onClick={startGame}
//               >
//                 Play Again
//               </button>
//             </div>
//           )}
          
//           {/* Game stats */}
//           {gameStarted && (
//             <div className="absolute top-2 left-2 flex space-x-4">
//               <div>Score: {score}</div>
//               <div>Lives: {Array(lives).fill('❤️').join('')}</div>
//               <div>Level: {Math.floor(gameSpeed / 10)}</div>
//             </div>
//           )}
//         </div>
        
//         <div className="mt-4 text-sm text-gray-300">
//           <p>Controls: Left/Right Arrow Keys or Mouse</p>
//         </div>
//       </div>
//     );
//   };
  
//   export default Game;