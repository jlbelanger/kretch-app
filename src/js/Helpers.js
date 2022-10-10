export const capitalize = (s) => (
	s.replace(/(?:^|\s)\S/g, (a) => (a.toUpperCase()))
);

export const getActivePlayer = (currentRoom) => (
	currentRoom.players[currentRoom.currentPlayerIndex]
);

export const isPlayer = (player, currentPlayer) => (
	player && currentPlayer && player.id === currentPlayer.id
);

export const isActivePlayer = (currentRoom, currentPlayer) => (
	isPlayer(getActivePlayer(currentRoom), currentPlayer)
);
