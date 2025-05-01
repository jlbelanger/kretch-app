// Reveal answer to all players
import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function Step4({
	currentPlayer,
	currentRoom,
	socket,
}) {
	const [loading, setLoading] = useState(false);
	const activePlayer = getActivePlayer(currentRoom);
	const isActive = isActivePlayer(currentRoom, currentPlayer);
	const [comment] = useState(() => {
		let comments;
		if (currentRoom.wasCorrect) {
			comments = [
				'Nice one!',
				'Awesome!',
				'Good job, team!',
			];
		} else {
			comments = [
				'Well, that stinks.',
			];
			if (isActive) {
				comments.push('Don’t quit your day job.');
				comments.push('Those guys suck.');
				comments.push('They really should have got that one.');
			} else {
				comments.push(`${activePlayer.name} is really bad at this.`);
				comments.push('You suck.');
				comments.push('You really should have got that one.');
			}
		}
		const num = comments.length;
		return comments[Math.floor(Math.random() * num)];
	});

	const { currentCategory, currentClue } = currentRoom;
	let info = currentCategory.slug === 'song' ? ` by ${currentClue.info}` : '';
	if (currentClue.year) {
		info += ` from ${currentClue.year}`;
	}
	if (currentCategory.slug === 'person' && currentClue.info) {
		info += ` from ${currentClue.info}`;
	}

	const onNext = () => {
		setLoading(true);
		socket.emit('CHANGE_PLAYER', { roomId: currentRoom.id });
	};

	if (loading) {
		return (
			<div className="spinner" role="status">Loading...</div>
		);
	}

	return (
		<section>
			<h1 className="text">{`${comment} The answer was:`}</h1>

			<p className="highlight">{currentClue.name}</p>

			{currentClue.img ? (
				<p>
					<img alt="" height={currentClue.height} src={currentClue.img} width={currentClue.width} />
				</p>
			) : (
				<p>
					{`That’s a ${currentCategory.name}${info}, in case you didn’t know.`}
				</p>
			)}

			{isActive ? (
				<p style={{ lineHeight: 1.4 }}>
					<button onClick={onNext} type="button">Next player</button>
				</p>
			) : (
				<p className="wait">
					{`Waiting for ${activePlayer.name} to pass to the next player.`}
				</p>
			)}
		</section>
	);
}

Step4.propTypes = {
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	socket: PropTypes.object.isRequired,
};
