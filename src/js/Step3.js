// Show timer
import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Step3({
	currentPlayer,
	currentRoom,
	socket,
}) {
	const [deadline] = useState(new Date().getTime() + (currentRoom.settings.maxMinutes * 60000));
	const [remainingSeconds, setRemainingSeconds] = useState(currentRoom.settings.maxMinutes * 60);
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const onNext = (e) => {
		if (isActive) {
			socket.emit('COMPLETE_CLUE', { code: currentRoom.code, wasCorrect: !!e });
		}
	};

	const now = () => new Date().getTime();

	const calculateRemainingSeconds = () => Math.round((deadline - now()) / 1000);

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

	return (
		<section>
			<div id="icons">
				<div className={`icon method-${currentRoom.currentMethod.slug}`} />
				<div className={`icon category-${currentRoom.currentCategory.slug}`} />
			</div>

			{isActive ? (
				<>
					<p>
						{`${currentPlayer.name}, ${currentRoom.currentMethod.name} the ${currentRoom.currentCategory.name}:`}
					</p>

					<p className="highlight">{currentRoom.currentClue.name}</p>
				</>
			) : (
				<p>
					{`${getActivePlayer(currentRoom).name} will now ${currentRoom.currentMethod.name} a ${currentRoom.currentCategory.name} for you.`}
				</p>
			)}

			<p id="timer">
				{formatTime(remainingSeconds)}
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
