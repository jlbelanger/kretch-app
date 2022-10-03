// Show clue to current player
import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Step2({
	currentCategorySlug,
	currentPlayer,
	currentRoom,
	retrieveClue,
	socket,
}) {
	const [numSkips, setNumSkips] = useState(0);
	const [isSkipDisabled, setIsSkipDisabled] = useState(false);
	const activePlayer = getActivePlayer(currentRoom);
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	useEffect(() => {
		socket.on('RETRIEVED_CLUE', () => {
			setTimeout(() => {
				setIsSkipDisabled(false);
			}, 200);
		});
	});

	const onNext = () => {
		socket.emit('PICK_CLUE', { code: currentRoom.code });
	};

	const onSkip = () => {
		if (numSkips >= currentRoom.settings.maxSkips) {
			return;
		}

		setIsSkipDisabled(true);
		retrieveClue(currentCategorySlug);
		setNumSkips(numSkips + 1);
	};

	if (isActive && currentRoom.currentClue) {
		const method = currentRoom.currentMethod;
		const clue = currentRoom.currentClue;
		const category = currentRoom.currentCategory;
		const methodClassName = `icon method-${method.slug}`;
		const categoryClassName = `icon category-${category.slug}`;
		const numSkipsRemaining = currentRoom.settings.maxSkips - numSkips;

		return (
			<section>
				<div id="icons">
					<div className={methodClassName} />
					<div className={categoryClassName} />
				</div>

				<p>
					{`${category.pre[method.slug]} the ${category.name}:`}
				</p>

				<p className="highlight" id="clue">{clue.name}</p>

				{clue.img ? (
					<p>
						<img alt="" height={clue.height} src={clue.img} width={clue.width} />
					</p>
				) : null}

				<p>
					<button onClick={onNext} type="button">Okay, let&rsquo;s do this</button>
					<button className="button--secondary" disabled={isSkipDisabled || numSkipsRemaining <= 0} onClick={onSkip} type="button">
						Skip
						{numSkipsRemaining <= 3 ? ` (${numSkipsRemaining} remaining)` : ''}
					</button>
				</p>
			</section>
		);
	}

	return (
		<section>
			<p className="wait">
				{`Waiting for ${activePlayer.name} to get a clue.`}
			</p>
		</section>
	);
}

Step2.propTypes = {
	currentCategorySlug: PropTypes.string,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	retrieveClue: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};

Step2.defaultProps = {
	currentCategorySlug: '',
};
