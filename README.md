# TGSR - a html tag guesser game

## Development

### Prerequisites
- Node.js 18+ (empfohlen: 20+)
- pnpm 9.15.2 (wird automatisch via `packageManager` field verwendet)

### Setup
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev          # Starts both server and client
pnpm dev:server   # Server only
pnpm dev:client   # Client only
```

### Build
```bash
pnpm build        # Build for production
pnpm start        # Run production server
```

### Testing
```bash
pnpm test         # Run tests with Vitest
```

## idea

this should be a fast competitive guessing game for html tags.

### the game play

- a player creates a game (and hosts it) and sets a maximum playing time (1 to 5 minutes)
- other player(s) join the game
- the host starts the game and the timer starts

#### game variant one / aka sharpshooter

- each player can enter the name of an html tag, for each correct tag the player sees his entry in a list of tags
- when the time is over nobody can enter more tags
- the winner is calculated
  - if a player has guessed a tag and nobody else has guessed the tag he recveives as many points as  there are players in the game
  - for each other player that has guessed tha tag, he receives one point less for each tag
  - the player with the most points wins

#### game variant two / aka quickdraw

- if one player enters a tag, the tag is shown to all other players in the game and this tag will not score for another player
- the player with the most points wins

## Architecture

Your Proposed Architecture

```
┌─────────────┐                    ┌─────────────┐
│  Browser    │                    │  Browser    │
│  (Host)     │◄──── WebSocket ───►│  (Player 2) │
│             │                    │             │
│ localStorage│        ▲ ▲         │ localStorage│
│  - playerId │        │ │         │  - playerId │
│  - gameData │        │ │         │  - gameData │
└─────────────┘        │ │         └─────────────┘
                       │ │
                  ┌────┴─┴────┐
                  │  Node.js   │
                  │  WebSocket │
                  │  Server    │
                  │            │
                  │ In-Memory: │
                  │  - games   │
                  │  - players │
                  │  - subs    │
                  └────────────┘
```

Stateless! Restart = empty
