import PropTypes from 'prop-types';
import { useState } from 'react';

export default function GameOver({
	currentPlayer,
	currentRoom,
	setScreen,
	socket,
}) {
	const [loading, setLoading] = useState(false);

	const startGame = () => {
		setLoading(true);
		socket.emit('LEAVE_ROOM', { roomId: currentRoom.id, playerId: currentPlayer.id });
		setScreen('welcome');
	};

	if (loading) {
		return (
			<div className="spinner" role="status">Loading...</div>
		);
	}

	return (
		<section>
			<h1>There are no more questions</h1>
			<p>...congratulations?</p>
			<p>
				<button onClick={startGame} type="button">Start a new game</button>
			</p>
		</section>
	);
}

GameOver.propTypes = {
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	setScreen: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
