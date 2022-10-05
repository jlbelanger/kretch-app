import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function Room({ currentPlayer, currentRoom, setScreen, socket }) {
	const [maxSkips, setMaxSkips] = useState(3);
	const [maxMinutes, setMaxMinutes] = useState(2);
	const [maxSkipsError, setMaxSkipsError] = useState('');
	const [maxMinutesError, setMaxMinutesError] = useState('');
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const submit = (e) => {
		e.preventDefault();

		let isValid = true;

		if (!maxSkips || Number.isNaN(parseFloat(maxSkips))) {
			setMaxSkipsError('Invalid number.');
			isValid = false;
		} else {
			setMaxSkipsError('');
		}

		if (!maxMinutes || maxMinutes === '0' || Number.isNaN(parseFloat(maxMinutes))) {
			setMaxMinutesError('Invalid number.');
			isValid = false;
		} else {
			setMaxMinutesError('');
		}

		if (!isValid) {
			return;
		}

		socket.emit('START_GAME', { code: currentRoom.code, maxMinutes, maxSkips });
	};

	const back = () => {
		socket.emit('LEAVE_ROOM', { code: currentRoom.code, playerId: currentPlayer.id });
		setScreen('welcome');
	};

	return (
		<form className="mini" onSubmit={submit}>
			<button className="icon" id="back" onClick={back} type="button">Back</button>

			<h1>{`Room: ${currentRoom.code}`}</h1>

			{currentRoom.players.map((player) => (
				<p className="player" key={player.id}>{player.name}</p>
			))}

			{isActive ? (
				<>
					<div className="flex" style={{ justifyContent: 'space-between' }}>
						<div className="field">
							<label htmlFor="max-skips">Skips:</label>
							<div className={`field__input-wrapper${maxSkipsError ? ' field__input-wrapper--invalid' : ''}`}>
								<input
									id="max-skips"
									inputMode="numeric"
									maxLength={3}
									onChange={(e) => setMaxSkips(e.target.value)}
									size={4}
									value={maxSkips}
								/>
							</div>
						</div>

						<div className="field">
							<label htmlFor="max-minutes">Minutes:</label>
							<div className={`field__input-wrapper${maxMinutesError ? ' field__input-wrapper--invalid' : ''}`}>
								<input
									id="max-minutes"
									inputMode="decimal"
									maxLength={3}
									onChange={(e) => setMaxMinutes(e.target.value)}
									size={4}
									value={maxMinutes}
								/>
							</div>
						</div>
					</div>

					<div className="flex" style={{ justifyContent: 'space-between' }}>
						<span className="field-error" style={{ textAlign: 'left' }}>{maxSkipsError}</span>
						<span className="field-error" style={{ textAlign: 'right' }}>{maxMinutesError}</span>
					</div>
				</>
			) : (
				<p className="wait">
					{`Waiting for ${getActivePlayer(currentRoom).name} to start the game.`}
				</p>
			)}

			<p>
				{isActive && <button type="submit">Start game</button>}
			</p>
		</form>
	);
}

Room.propTypes = {
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	setScreen: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
