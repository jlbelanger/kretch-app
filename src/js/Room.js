import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function Room({ currentPlayer, currentRoom, setScreen, socket }) {
	const [maxSkips, setMaxSkips] = useState(3);
	const [maxMinutes, setMaxMinutes] = useState(2);
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const startGame = () => {
		socket.emit('START_GAME', { code: currentRoom.code, maxMinutes, maxSkips });
	};

	const back = () => {
		socket.emit('LEAVE_ROOM', { code: currentRoom.code, playerId: currentPlayer.id });
		setScreen('welcome');
	};

	return (
		<section className="mini">
			<h1>{`Room: ${currentRoom.code}`}</h1>

			{currentRoom.players.map((player) => (
				<p className="player" key={player.id}>{player.name}</p>
			))}

			{isActive ? (
				<p className="flex">
					<label htmlFor="max-skips">Skips:</label>
					<input
						id="max-skips"
						inputMode="numeric"
						maxLength={3}
						onChange={(e) => setMaxSkips(e.target.value)}
						value={maxSkips}
					/>

					<label htmlFor="max-minutes">&nbsp;&nbsp;Minutes:</label>
					<input
						id="max-minutes"
						inputMode="numeric"
						maxLength={2}
						onChange={(e) => setMaxMinutes(e.target.value)}
						value={maxMinutes}
					/>
				</p>
			) : (
				<p className="wait">
					{`Waiting for ${getActivePlayer(currentRoom).name} to start the game.`}
				</p>
			)}

			<p>
				{isActive && <button onClick={startGame} type="button">Start game</button>}
				<button className="button--secondary" onClick={back} type="button">Back</button>
			</p>
		</section>
	);
}

Room.propTypes = {
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	setScreen: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
