// Show timer
import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Step3({
	currentPlayer,
	currentRoom,
	socket,
}) {
	const now = () => new Date().getTime();
	const [loading, setLoading] = useState(false);
	const [deadline] = useState(currentRoom.deadline);
	const calculateRemainingSeconds = () => Math.round((deadline - now()) / 1000);
	const [remainingSeconds, setRemainingSeconds] = useState(calculateRemainingSeconds());
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const onNext = (e) => {
		setLoading(true);
		if (isActive) {
			socket.emit('COMPLETE_CLUE', { roomId: currentRoom.id, wasCorrect: !!e });
		}
	};

	const tick = () => {
		if (remainingSeconds <= 0) {
			onNext(false);
			return;
		}
		setRemainingSeconds(calculateRemainingSeconds());
	};

	useEffect(() => {
		setTimeout(tick, 1000);
	}, [remainingSeconds]);

	const pad = (n, width, z) => {
		z = z || '0';
		n = n.toString();
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};

	const formatTime = (total) => {
		const minutes = Math.floor(total / 60);
		const seconds = total % 60;
		return `${minutes}:${pad(seconds, 2, '0')}`;
	};

	const formatTimeAria = (total) => {
		const time = formatTime(total).split(':');
		const minutes = parseInt(time[0], 10);
		const seconds = Math.ceil(parseInt(time[1], 10) / 10) * 10;
		if (minutes === 0) {
			return `${seconds} second${seconds === 1 ? '' : 's'}`;
		}
		if (seconds === 0) {
			return `${minutes} minute${minutes === 1 ? '' : 's'}`;
		}
		return `${minutes} minute${minutes === 1 ? '' : 's'}, ${seconds} second${seconds === 1 ? '' : 's'}`;
	};

	if (loading) {
		return (
			<div className="spinner" role="status">Loading...</div>
		);
	}

	return (
		<section>
			<div id="icons">
				<div className={`icon method-${currentRoom.currentMethod.slug}`} />
				<div className={`icon category-${currentRoom.currentCategory.slug}`} />
			</div>

			{isActive ? (
				<>
					<h1 className="text">
						{`${currentPlayer.name}, ${currentRoom.currentMethod.name} the ${currentRoom.currentCategory.name}:`}
					</h1>

					<p className="highlight">{currentRoom.currentClue.name}</p>
				</>
			) : (
				<p>
					{`${getActivePlayer(currentRoom).name} will now ${currentRoom.currentMethod.name} a ${currentRoom.currentCategory.name} for you.`}
				</p>
			)}

			<p aria-label={`Time remaining: ${formatTimeAria(remainingSeconds)}`} id="timer" role="status">
				<span aria-hidden="true">{formatTime(remainingSeconds)}</span>
			</p>

			{isActive && (
				<p>
					<button onClick={onNext} type="button">They got it!</button>
				</p>
			)}
		</section>
	);
}

Step3.propTypes = {
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	socket: PropTypes.object.isRequired,
};
