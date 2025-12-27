# TGSR - a html tag guesser game

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
