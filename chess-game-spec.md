# Chess Game Development Specification

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Design](#architecture-design)
3. [Technical Requirements](#technical-requirements)
4. [ECS System Design](#ecs-system-design)
5. [React Integration](#react-integration)
6. [Component Specifications](#component-specifications)
7. [System Specifications](#system-specifications)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Testing Strategy](#testing-strategy)
10. [Extension Points](#extension-points)

## Project Overview

### Objective
Create a fully functional chess game using Entity Component System (ECS) architecture with Miniplex and React for the user interface. The game should implement all standard chess rules and provide an intuitive, visually appealing interface.

### Key Features
- Complete chess rule implementation
- Interactive web-based UI
- Move validation and game state management
- Visual feedback for piece selection and valid moves
- Game history tracking
- Checkmate and stalemate detection
- Responsive design

### Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **ECS Library**: Miniplex
- **Styling**: Tailwind CSS
- **State Management**: React hooks + ECS world state
- **Build Tool**: Vite/Create React App (recommended)

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application Layer                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   ChessGame     │  │   GameInfo      │  │  ChessSquare │ │
│  │   Component     │  │   Component     │  │  Component   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      ECS Game Engine                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   ChessECS      │  │   World         │  │   Systems    │ │
│  │   Controller    │  │   Management    │  │   & Queries  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    ECS World Data Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Components    │  │    Entities     │  │  Archetypes  │ │
│  │   (Data)        │  │   (Game Pieces) │  │  (Queries)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → React Event Handlers
2. **Event Handlers** → ECS Controller Methods
3. **ECS Controller** → World State Updates
4. **World State Changes** → React State Synchronization
5. **React State Updates** → UI Re-render

## Technical Requirements

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^4.9.0",
    "miniplex": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### File Structure
```
src/
├── components/
│   ├── ChessGame.tsx
│   ├── ChessSquare.tsx
│   ├── GameInfo.tsx
│   └── index.ts
├── engine/
│   ├── ChessECS.ts
│   ├── components/
│   │   ├── PositionComponent.ts
│   │   ├── PieceComponent.ts
│   │   ├── MovePatternComponent.ts
│   │   ├── GameStateComponent.ts
│   │   └── BoardComponent.ts
│   ├── systems/
│   │   ├── MovementSystem.ts
│   │   ├── ValidationSystem.ts
│   │   └── GameStateSystem.ts
│   └── types/
│       ├── Chess.ts
│       └── ECS.ts
├── utils/
│   ├── ChessNotation.ts
│   └── MovePatterns.ts
└── App.tsx
```

## ECS System Design

### Core Components

#### 1. PositionComponent
```typescript
interface PositionComponent {
  row: number;      // 0-7, where 0 is top rank (black's back rank)
  col: number;      // 0-7, where 0 is 'a' file
}
```

#### 2. PieceComponent
```typescript
interface PieceComponent {
  type: PieceType;          // KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN
  color: Color;             // WHITE, BLACK
  hasMoved: boolean;        // For castling and pawn double-move logic
  value?: number;           // Optional: piece value for AI evaluation
}
```

#### 3. MovePatternComponent
```typescript
interface MovePatternComponent {
  patterns: MovePattern[];
}

interface MovePattern {
  type: 'linear' | 'jump' | 'special';
  directions: { row: number; col: number }[];
  maxDistance?: number;
  conditions?: (entity: Entity, world: World) => boolean;
  special?: 'pawn_forward' | 'pawn_capture' | 'castling' | 'en_passant';
}
```

#### 4. GameStateComponent
```typescript
interface GameStateComponent {
  currentPlayer: Color;
  status: GameStatus;       // PLAYING, CHECK, CHECKMATE, STALEMATE, DRAW
  moveHistory: Move[];
  moveCount: number;
  fiftyMoveRule: number;    // For draw detection
  enPassantTarget?: Position;
  castlingRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
}
```

#### 5. BoardComponent
```typescript
interface BoardComponent {
  squares: (Entity | null)[][];  // 8x8 grid of piece entities
}
```

### Entity Archetypes

```typescript
// Define entity queries for efficient system access
const pieces = world.archetype('position', 'piece', 'movePattern');
const gameState = world.archetype('gameState');
const board = world.archetype('board');
const kings = world.archetype('position', 'piece').where(e => e.piece.type === PieceType.KING);
```

### Core Enums and Types

```typescript
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
  piece: PieceType;
  capturedPiece?: PieceType;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
  notation?: string;        // Algebraic notation
}
```

## React Integration

### State Management Strategy

#### ECS-React Bridge Pattern
```typescript
class ChessECS {
  private world: World;
  private pieces: any;
  private gameState: any;
  private board: any;

  // Public API for React integration
  public makeMove(from: Position, to: Position): boolean;
  public getPossibleMoves(entity: Entity): Position[];
  public getCurrentPlayer(): Color;
  public getGameStatus(): GameStatus;
  public getBoardState(): (Entity | null)[][];
  public getMoveHistory(): Move[];
  public isInCheck(color: Color): boolean;
  public resetGame(): void;
}
```

#### React State Hooks
```typescript
const ChessGame: React.FC = () => {
  // ECS instance (stable reference)
  const [chess] = useState(() => new ChessECS());
  
  // UI state (derived from ECS state)
  const [boardState, setBoardState] = useState<(Entity | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Color>(Color.WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  
  // State synchronization
  const updateGameState = useCallback(() => {
    setBoardState([...chess.getBoardState()]);
    setCurrentPlayer(chess.getCurrentPlayer());
    setGameStatus(chess.getGameStatus());
    setMoveHistory([...chess.getMoveHistory()]);
  }, [chess]);
};
```

## Component Specifications

### ChessGame (Main Container)
**Responsibilities:**
- Manage ECS instance lifecycle
- Handle user interactions (square clicks)
- Coordinate state synchronization
- Render board and game info

**Key Methods:**
```typescript
const handleSquareClick = (row: number, col: number) => {
  // 1. Handle piece selection
  // 2. Handle move execution
  // 3. Update visual state
  // 4. Sync with ECS state
};

const resetGame = () => {
  // 1. Create new ECS instance
  // 2. Reset UI state
  // 3. Trigger re-render
};
```

### ChessSquare (Individual Square)
**Props Interface:**
```typescript
interface ChessSquareProps {
  piece: Entity | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  isInCheck?: boolean;
  onClick: () => void;
}
```

**Visual States:**
- Default square color (light/dark)
- Selected piece highlight
- Possible move indicators
- Last move highlights
- Check warning for king

### GameInfo (Status Panel)
**Features:**
- Current player display
- Game status (playing, check, checkmate, etc.)
- Move history with algebraic notation
- Captured pieces display
- Game controls (reset, undo)

## System Specifications

### MovementSystem
**Core Functions:**

#### 1. Move Pattern Generation
```typescript
class MovePatternFactory {
  static createLinearPattern(directions: Direction[], maxDistance?: number): MovePattern;
  static createJumpPattern(offsets: Position[]): MovePattern;
  static createPawnPattern(color: Color): MovePattern[];
  static createCastlingPattern(): MovePattern;
}
```

#### 2. Move Validation Pipeline
```typescript
interface MoveValidator {
  validateBasicMove(from: Position, to: Position): boolean;
  validatePieceMovement(entity: Entity, to: Position): boolean;
  validatePathClear(from: Position, to: Position): boolean;
  validateNotOwnPiece(to: Position, color: Color): boolean;
  validateNotInCheck(from: Position, to: Position): boolean;
}
```

### Special Move Implementation

#### Castling System
```typescript
interface CastlingValidator {
  canCastle(color: Color, side: 'kingside' | 'queenside'): boolean;
  validateCastlingConditions(king: Entity, rook: Entity): boolean;
  executeCastling(king: Entity, rook: Entity): void;
}
```

#### En Passant System
```typescript
interface EnPassantSystem {
  checkEnPassantAvailable(pawn: Entity, target: Position): boolean;
  executeEnPassant(pawn: Entity, target: Position): void;
  updateEnPassantTarget(move: Move): void;
}
```

#### Pawn Promotion System
```typescript
interface PromotionSystem {
  checkPromotionRequired(pawn: Entity, to: Position): boolean;
  executePromotion(pawn: Entity, newPieceType: PieceType): void;
}
```

### Game State Management

#### Check Detection
```typescript
class CheckSystem {
  isSquareAttacked(position: Position, byColor: Color): boolean;
  isKingInCheck(color: Color): boolean;
  findCheckingPieces(kingColor: Color): Entity[];
  canBlockCheck(kingColor: Color): boolean;
}
```

#### Game End Detection
```typescript
class GameEndSystem {
  detectCheckmate(color: Color): boolean;
  detectStalemate(color: Color): boolean;
  detectDraw(): 'fifty_move' | 'repetition' | 'insufficient_material' | null;
  hasLegalMoves(color: Color): boolean;
}
```

## Implementation Guidelines

### Phase 1: Core ECS Setup
1. **Initialize Miniplex World**
   - Set up world instance
   - Define component interfaces
   - Create archetype queries

2. **Implement Basic Components**
   - Position, Piece, MovePattern components
   - GameState and Board management
   - Entity creation utilities

3. **Basic Move System**
   - Simple move pattern matching
   - Basic validation (bounds checking)
   - Board state updates

### Phase 2: Chess Rules Implementation
1. **Piece Movement Patterns**
   - Implement each piece type's movement
   - Path clearing for sliding pieces
   - Jump movement for knights

2. **Special Rules**
   - Pawn double-move and en passant
   - Castling implementation
   - Pawn promotion

3. **Game State Logic**
   - Check detection
   - Checkmate and stalemate
   - Move history and notation

### Phase 3: React Integration
1. **Basic UI Components**
   - ChessSquare with piece rendering
   - Board layout and coordinates
   - Click handling

2. **State Synchronization**
   - ECS state → React state bridge
   - Event handling pipeline
   - Visual feedback systems

3. **Enhanced UI Features**
   - Move highlighting
   - Game info panel
   - Responsive design

### Phase 4: Polish and Extensions
1. **Visual Enhancements**
   - Animations for moves
   - Better piece graphics
   - Theme support

2. **Advanced Features**
   - Move undo/redo
   - Game save/load
   - PGN export/import

### Code Quality Guidelines

#### TypeScript Best Practices
- Use strict type checking
- Define interfaces for all data structures
- Use enums for constants
- Implement proper error handling

#### ECS Best Practices
- Keep components as pure data
- Use systems for all logic
- Leverage queries for performance
- Avoid direct world manipulation in React

#### React Best Practices
- Use functional components with hooks
- Implement proper key props for lists
- Optimize with useMemo/useCallback where needed
- Follow single responsibility principle

### Error Handling Strategy

#### ECS Level
```typescript
class ChessError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Usage
if (!isValidMove) {
  throw new ChessError('Invalid move attempted', 'INVALID_MOVE');
}
```

#### React Level
```typescript
const [error, setError] = useState<string | null>(null);

const handleMove = async (from: Position, to: Position) => {
  try {
    setError(null);
    const success = chess.makeMove(from, to);
    if (!success) {
      setError('Invalid move');
    }
  } catch (err) {
    setError(err instanceof ChessError ? err.message : 'Unknown error');
  }
};
```

## Testing Strategy

### Unit Tests
- **Component Tests**: Each ECS component interface
- **System Tests**: Move validation, game state logic
- **Utility Tests**: Notation conversion, pattern matching

### Integration Tests
- **ECS Integration**: Full move cycle testing
- **React Integration**: UI interaction testing
- **State Sync**: ECS ↔ React state consistency

### End-to-End Tests
- **Game Flow**: Complete game scenarios
- **Edge Cases**: Special moves, game end conditions
- **Performance**: Large game histories, complex positions

### Test Data
```typescript
// Sample test positions
const TEST_POSITIONS = {
  STARTING_POSITION: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  CHECKMATE_POSITION: 'rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  CASTLING_POSITION: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'
};
```

## Extension Points

### AI Integration
```typescript
interface ChessAI {
  evaluatePosition(board: BoardComponent): number;
  findBestMove(color: Color, depth: number): Move;
  openingBook?: Map<string, Move[]>;
}
```

### Multiplayer Support
```typescript
interface NetworkManager {
  sendMove(move: Move): Promise<void>;
  receiveMove(): Promise<Move>;
  syncGameState(): Promise<GameStateComponent>;
}
```

### Analysis Features
```typescript
interface GameAnalyzer {
  analyzePosition(board: BoardComponent): PositionAnalysis;
  suggestMoves(color: Color): Move[];
  detectTactics(): Tactic[];
}
```

### Performance Optimizations
- **Move Generation Caching**: Cache legal moves for positions
- **Incremental Updates**: Only update changed board squares
- **Web Workers**: Move AI calculation to background thread

This specification provides a comprehensive guide for implementing a chess game with ECS architecture and React. The modular design allows for incremental development and easy extension with advanced features.