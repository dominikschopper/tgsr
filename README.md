# TGSR - a html tag guesser game

this is a simple HTML tag guessing game, you must know yyour HTML, if you want to play that, there are two playing mode and
you can play with your friends together ;) hope this will be fun!

there is a deployed version on Render.com that you can paly with or you download this and run it locally on your machine.

see **[tgsr at render.com](https://tgsr.onrender.com)**

please keep in mind, this is the free tier of render.com so it can take some 30 seconds until the server is started up!

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

## Deployment

### Deploy to Render.com

This project is configured for easy deployment to Render.com:

1. Push your code to GitHub
2. Go to [Render.com](https://render.com/) and sign up/login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and configure everything
6. Click "Create Web Service"

The app will be deployed with:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Region**: Frankfurt
- **Plan**: Free (with sleep after 15min inactivity)

**Note**: On the free plan, the service sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

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
