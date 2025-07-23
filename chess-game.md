import React, { useState, useEffect, useCallback } from 'react';
import { World, Entity } from 'miniplex';

// Types and Enums
enum Color {
  WHITE = 'white',
  BLACK = 'black'
}

enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king'
}

enum GameStatus {
  PLAYING = 'playing',
  CHECK = 'check',
  CHECKMATE = 'checkmate',
  STALEMATE = 'stalemate',
  DRAW = 'draw'
}

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
  pieceType: PieceType;
  capturedPiece?: PieceType;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
}

// Components
interface PositionComponent {
  row: number;
  col: number;
}

interface PieceComponent {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

interface MovePatternComponent {
  patterns: MovePattern[];
}

interface MovePattern {
  type: 'linear' | 'jump' | 'special';
  directions: { row: number; col: number }[];
  maxDistance?: number;
  conditions?: (entity: Entity, world: World) => boolean;
}

interface GameStateComponent {
  currentPlayer: Color;
  status: GameStatus;
  moveHistory: Move[];
  moveCount: number;
}

interface BoardComponent {
  squares: (Entity | null)[][];
}

// ECS Chess Engine
class ChessECS {
  private world: World;
  private pieces: any;
  private gameState: any;
  private board: any;

  constructor() {
    this.world = new World();
    this.pieces = this.world.archetype('position', 'piece', 'movePattern');
    this.gameState = this.world.archetype('gameState');
    this.board = this.world.archetype('board');
    this.initializeGame();
  }

  private initializeGame(): void {
    this.world.add({
      gameState: {
        currentPlayer: Color.WHITE,
        status: GameStatus.PLAYING,
        moveHistory: [],
        moveCount: 0
      }
    });

    const squares: (Entity | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    this.world.add({
      board: { squares }
    });

    this.setupInitialPosition();
  }

  private getMovePatterns(pieceType: PieceType, color: Color): MovePattern[] {
    const createLinearMovePattern = (directions: { row: number; col: number }[], maxDistance: number = 7): MovePattern => ({
      type: 'linear',
      directions,
      maxDistance
    });

    const createJumpMovePattern = (directions: { row: number; col: number }[]): MovePattern => ({
      type: 'jump',
      directions
    });

    switch (pieceType) {
      case PieceType.PAWN:
        const direction = color === Color.WHITE ? -1 : 1;
        return [
          {
            type: 'special',
            directions: [
              { row: direction, col: 0 },
              { row: direction * 2, col: 0 },
              { row: direction, col: -1 },
              { row: direction, col: 1 }
            ]
          }
        ];
      case PieceType.ROOK:
        return [createLinearMovePattern([
          { row: 0, col: 1 }, { row: 0, col: -1 },
          { row: 1, col: 0 }, { row: -1, col: 0 }
        ])];
      case PieceType.BISHOP:
        return [createLinearMovePattern([
          { row: 1, col: 1 }, { row: 1, col: -1 },
          { row: -1, col: 1 }, { row: -1, col: -1 }
        ])];
      case PieceType.QUEEN:
        return [createLinearMovePattern([
          { row: 0, col: 1 }, { row: 0, col: -1 },
          { row: 1, col: 0 }, { row: -1, col: 0 },
          { row: 1, col: 1 }, { row: 1, col: -1 },
          { row: -1, col: 1 }, { row: -1, col: -1 }
        ])];
      case PieceType.KING:
        return [createLinearMovePattern([
          { row: 0, col: 1 }, { row: 0, col: -1 },
          { row: 1, col: 0 }, { row: -1, col: 0 },
          { row: 1, col: 1 }, { row: 1, col: -1 },
          { row: -1, col: 1 }, { row: -1, col: -1 }
        ], 1)];
      case PieceType.KNIGHT:
        return [createJumpMovePattern([
          { row: -2, col: -1 }, { row: -2, col: 1 },
          { row: -1, col: -2 }, { row: -1, col: 2 },
          { row: 1, col: -2 }, { row: 1, col: 2 },
          { row: 2, col: -1 }, { row: 2, col: 1 }
        ])];
      default:
        return [];
    }
  }

  private setupInitialPosition(): void {
    const boardEntity = this.board.first;
    if (!boardEntity) return;

    const pieceSetup = [
      { row: 0, col: 0, type: PieceType.ROOK, color: Color.BLACK },
      { row: 0, col: 1, type: PieceType.KNIGHT, color: Color.BLACK },
      { row: 0, col: 2, type: PieceType.BISHOP, color: Color.BLACK },
      { row: 0, col: 3, type: PieceType.QUEEN, color: Color.BLACK },
      { row: 0, col: 4, type: PieceType.KING, color: Color.BLACK },
      { row: 0, col: 5, type: PieceType.BISHOP, color: Color.BLACK },
      { row: 0, col: 6, type: PieceType.KNIGHT, color: Color.BLACK },
      { row: 0, col: 7, type: PieceType.ROOK, color: Color.BLACK },
      { row: 7, col: 0, type: PieceType.ROOK, color: Color.WHITE },
      { row: 7, col: 1, type: PieceType.KNIGHT, color: Color.WHITE },
      { row: 7, col: 2, type: PieceType.BISHOP, color: Color.WHITE },
      { row: 7, col: 3, type: PieceType.QUEEN, color: Color.WHITE },
      { row: 7, col: 4, type: PieceType.KING, color: Color.WHITE },
      { row: 7, col: 5, type: PieceType.BISHOP, color: Color.WHITE },
      { row: 7, col: 6, type: PieceType.KNIGHT, color: Color.WHITE },
      { row: 7, col: 7, type: PieceType.ROOK, color: Color.WHITE },
    ];

    for (let col = 0; col < 8; col++) {
      pieceSetup.push(
        { row: 1, col, type: PieceType.PAWN, color: Color.BLACK },
        { row: 6, col, type: PieceType.PAWN, color: Color.WHITE }
      );
    }

    for (const setup of pieceSetup) {
      const entity = this.world.add({
        position: { row: setup.row, col: setup.col },
        piece: { type: setup.type, color: setup.color, hasMoved: false },
        movePattern: { patterns: this.getMovePatterns(setup.type, setup.color) }
      });

      boardEntity.board!.squares[setup.row][setup.col] = entity;
    }
  }

  public getPossibleMoves(entity: Entity): Position[] {
    if (!entity.position || !entity.piece || !entity.movePattern) {
      return [];
    }

    const moves: Position[] = [];
    const pos = entity.position;
    const piece = entity.piece;
    const boardEntity = this.board.first;
    if (!boardEntity) return moves;

    for (const pattern of entity.movePattern.patterns) {
      for (const direction of pattern.directions) {
        if (pattern.type === 'jump') {
          const newPos = {
            row: pos.row + direction.row,
            col: pos.col + direction.col
          };

          if (this.isValidPosition(newPos)) {
            const targetSquare = boardEntity.board!.squares[newPos.row][newPos.col];
            if (!targetSquare || targetSquare.piece!.color !== piece.color) {
              moves.push(newPos);
            }
          }
        } else if (pattern.type === 'linear') {
          const maxDist = pattern.maxDistance || 7;
          for (let i = 1; i <= maxDist; i++) {
            const newPos = {
              row: pos.row + (direction.row * i),
              col: pos.col + (direction.col * i)
            };

            if (!this.isValidPosition(newPos)) break;

            const targetSquare = boardEntity.board!.squares[newPos.row][newPos.col];
            if (targetSquare) {
              if (targetSquare.piece!.color !== piece.color) {
                moves.push(newPos);
              }
              break;
            }
            moves.push(newPos);
          }
        } else if (pattern.type === 'special' && piece.type === PieceType.PAWN) {
          const newPos = {
            row: pos.row + direction.row,
            col: pos.col + direction.col
          };

          if (this.isValidPosition(newPos)) {
            const targetSquare = boardEntity.board!.squares[newPos.row][newPos.col];
            
            if (direction.col === 0) {
              // Forward moves
              if (!targetSquare) {
                moves.push(newPos);
                // Two squares forward from start
                if (!piece.hasMoved && Math.abs(direction.row) === 2) {
                  moves.push(newPos);
                }
              }
            } else {
              // Diagonal captures
              if (targetSquare && targetSquare.piece!.color !== piece.color) {
                moves.push(newPos);
              }
            }
          }
        }
      }
    }

    return moves.filter(move => !this.wouldLeaveKingInCheck(entity, pos, move));
  }

  private isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }

  private wouldLeaveKingInCheck(pieceEntity: Entity, from: Position, to: Position): boolean {
    // Simplified check validation for demo
    return false;
  }

  public makeMove(from: Position, to: Position): boolean {
    const gameStateEntity = this.gameState.first;
    const boardEntity = this.board.first;
    if (!gameStateEntity || !boardEntity) return false;

    const pieceEntity = boardEntity.board!.squares[from.row][from.col];
    if (!pieceEntity || !pieceEntity.piece) return false;

    if (pieceEntity.piece.color !== gameStateEntity.gameState!.currentPlayer) {
      return false;
    }

    const possibleMoves = this.getPossibleMoves(pieceEntity);
    const validMove = possibleMoves.some(move => 
      move.row === to.row && move.col === to.col
    );

    if (!validMove) return false;

    const capturedPiece = boardEntity.board!.squares[to.row][to.col];
    
    boardEntity.board!.squares[to.row][to.col] = pieceEntity;
    boardEntity.board!.squares[from.row][from.col] = null;
    
    pieceEntity.position!.row = to.row;
    pieceEntity.position!.col = to.col;
    pieceEntity.piece!.hasMoved = true;

    if (capturedPiece) {
      this.world.remove(capturedPiece);
    }

    const move: Move = {
      from: { ...from },
      to: { ...to },
      pieceType: pieceEntity.piece.type,
      capturedPiece: capturedPiece?.piece?.type
    };
    gameStateEntity.gameState!.moveHistory.push(move);
    gameStateEntity.gameState!.moveCount++;

    gameStateEntity.gameState!.currentPlayer = 
      gameStateEntity.gameState!.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

    return true;
  }

  public getCurrentPlayer(): Color {
    const gameStateEntity = this.gameState.first;
    return gameStateEntity?.gameState?.currentPlayer || Color.WHITE;
  }

  public getGameStatus(): GameStatus {
    const gameStateEntity = this.gameState.first;
    return gameStateEntity?.gameState?.status || GameStatus.PLAYING;
  }

  public getPieceAt(position: Position): Entity | null {
    const boardEntity = this.board.first;
    if (!boardEntity) return null;
    return boardEntity.board!.squares[position.row][position.col];
  }

  public getBoardState(): (Entity | null)[][] {
    const boardEntity = this.board.first;
    return boardEntity?.board?.squares || [];
  }

  public getMoveHistory(): Move[] {
    const gameStateEntity = this.gameState.first;
    return gameStateEntity?.gameState?.moveHistory || [];
  }
}

// React Components
const PieceSymbols = {
  [PieceType.KING]: { [Color.WHITE]: '♔', [Color.BLACK]: '♚' },
  [PieceType.QUEEN]: { [Color.WHITE]: '♕', [Color.BLACK]: '♛' },
  [PieceType.ROOK]: { [Color.WHITE]: '♖', [Color.BLACK]: '♜' },
  [PieceType.BISHOP]: { [Color.WHITE]: '♗', [Color.BLACK]: '♝' },
  [PieceType.KNIGHT]: { [Color.WHITE]: '♘', [Color.BLACK]: '♞' },
  [PieceType.PAWN]: { [Color.WHITE]: '♙', [Color.BLACK]: '♟' },
};

interface ChessSquareProps {
  piece: Entity | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  onClick: () => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  piece,
  isLight,
  isSelected,
  isPossibleMove,
  isLastMove,
  onClick
}) => {
  const baseClasses = "w-16 h-16 flex items-center justify-center text-4xl cursor-pointer transition-all duration-200 select-none";
  const colorClasses = isLight ? "bg-amber-100" : "bg-amber-800";
  const stateClasses = [
    isSelected && "ring-4 ring-blue-500 ring-inset",
    isPossibleMove && "bg-green-400 bg-opacity-60",
    isLastMove && "bg-yellow-400 bg-opacity-60",
    "hover:brightness-110"
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={`${baseClasses} ${colorClasses} ${stateClasses}`}
      onClick={onClick}
    >
      {piece && piece.piece && (
        <span className={piece.piece.color === Color.WHITE ? "text-white drop-shadow-lg" : "text-black drop-shadow-lg"}>
          {PieceSymbols[piece.piece.type][piece.piece.color]}
        </span>
      )}
      {isPossibleMove && !piece && (
        <div className="w-4 h-4 bg-green-600 rounded-full opacity-80"></div>
      )}
    </div>
  );
};

interface GameInfoProps {
  currentPlayer: Color;
  gameStatus: GameStatus;
  moveHistory: Move[];
  onReset: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayer, gameStatus, moveHistory, onReset }) => {
  const getStatusColor = () => {
    switch (gameStatus) {
      case GameStatus.CHECK: return "text-orange-600";
      case GameStatus.CHECKMATE: return "text-red-600";
      case GameStatus.STALEMATE: return "text-gray-600";
      default: return "text-green-600";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Info</h2>
      
      <div className="mb-4">
        <p className="text-lg">
          <span className="font-semibold">Current Player:</span>{" "}
          <span className={currentPlayer === Color.WHITE ? "text-gray-700" : "text-gray-900"}>
            {currentPlayer === Color.WHITE ? "White" : "Black"}
          </span>
        </p>
        <p className="text-lg">
          <span className="font-semibold">Status:</span>{" "}
          <span className={getStatusColor()}>
            {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
          </span>
        </p>
      </div>

      <button
        onClick={onReset}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        New Game
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Move History</h3>
        <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
          {moveHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No moves yet</p>
          ) : (
            moveHistory.map((move, index) => (
              <div key={index} className="text-sm py-1">
                {Math.floor(index / 2) + 1}. {index % 2 === 0 ? '' : '... '}
                {move.pieceType.charAt(0).toUpperCase()}{ChessECS.positionToAlgebraic(move.from)} → {ChessECS.positionToAlgebraic(move.to)}
                {move.capturedPiece && ' ✕'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ChessGame: React.FC = () => {
  const [chess] = useState(() => new ChessECS());
  const [boardState, setBoardState] = useState<(Entity | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Color>(Color.WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  const updateGameState = useCallback(() => {
    setBoardState([...chess.getBoardState()]);
    setCurrentPlayer(chess.getCurrentPlayer());
    setGameStatus(chess.getGameStatus());
    setMoveHistory([...chess.getMoveHistory()]);
  }, [chess]);

  useEffect(() => {
    updateGameState();
  }, [updateGameState]);

  const handleSquareClick = (row: number, col: number) => {
    const clickedPos = { row, col };
    const piece = chess.getPieceAt(clickedPos);

    if (selectedSquare) {
      // Try to make a move
      if (possibleMoves.some(move => move.row === row && move.col === col)) {
        if (chess.makeMove(selectedSquare, clickedPos)) {
          setLastMove({ from: selectedSquare, to: clickedPos });
          updateGameState();
        }
      }
      
      // Deselect or select new piece
      if (piece && piece.piece?.color === currentPlayer && 
          (selectedSquare.row !== row || selectedSquare.col !== col)) {
        setSelectedSquare(clickedPos);
        setPossibleMoves(chess.getPossibleMoves(piece));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      // Select piece if it belongs to current player
      if (piece && piece.piece?.color === currentPlayer) {
        setSelectedSquare(clickedPos);
        setPossibleMoves(chess.getPossibleMoves(piece));
      }
    }
  };

  const resetGame = () => {
    // Create new chess instance
    const newChess = new ChessECS();
    Object.setPrototypeOf(chess, Object.getPrototypeOf(newChess));
    Object.assign(chess, newChess);
    
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    updateGameState();
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isSquarePossibleMove = (row: number, col: number) => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  const isSquareLastMove = (row: number, col: number) => {
    return lastMove && 
           ((lastMove.from.row === row && lastMove.from.col === col) ||
            (lastMove.to.row === row && lastMove.to.col === col));
  };

  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const piece = boardState[row]?.[col] || null;
        
        squares.push(
          <ChessSquare
            key={`${row}-${col}`}
            piece={piece}
            isLight={isLight}
            isSelected={isSquareSelected(row, col)}
            isPossibleMove={isSquarePossibleMove(row, col)}
            isLastMove={isSquareLastMove(row, col)}
            onClick={() => handleSquareClick(row, col)}
          />
        );
      }
    }
    return squares;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          React Chess with ECS
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Chess Board */}
          <div className="bg-amber-900 p-4 rounded-lg shadow-2xl">
            <div className="grid grid-cols-8 gap-0 border-2 border-amber-900">
              {renderBoard()}
            </div>
            
            {/* Board coordinates */}
            <div className="flex justify-between mt-2 px-2">
              {'abcdefgh'.split('').map(letter => (
                <span key={letter} className="text-amber-100 font-semibold w-16 text-center">
                  {letter}
                </span>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <GameInfo
            currentPlayer={currentPlayer}
            gameStatus={gameStatus}
            moveHistory={moveHistory}
            onReset={resetGame}
          />
        </div>
      </div>
    </div>
  );
};

// Add static methods to ChessECS for the component
ChessECS.algebraicToPosition = (algebraic: string): Position | null => {
  if (algebraic.length !== 2) return null;
  const col = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(algebraic[1]);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return { row, col }