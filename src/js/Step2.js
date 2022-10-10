// Show clue to current player
import { getActivePlayer, isActivePlayer } from './Helpers';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Step2({
	currentCategorySlug,
	currentPlayer,
	currentRoom,
	socket,
}) {
	const [loading, setLoading] = useState(false);
	const [loadingClue, setLoadingClue] = useState(true);
	const [numSkips, setNumSkips] = useState(0);
	const [isOkDisabled, setIsOkDisabled] = useState(true);
	const [isSkipDisabled, setIsSkipDisabled] = useState(true);
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const onRetrievedClue = () => {
		setLoadingClue(false);

		// Disable the buttons temporarily to prevent accidental double clicks.
		setTimeout(() => {
			setIsOkDisabled(false);
			setIsSkipDisabled(false);
		}, 200);
	};

	useEffect(() => {
		socket.on('RETRIEVED_CLUE', onRetrievedClue);

		return () => {
			socket.off('RETRIEVED_CLUE', onRetrievedClue);
		};
	}, []);

	const onNext = () => {
		setLoading(true);
		socket.emit('PICK_CLUE', { roomId: currentRoom.id });
	};

	const onSkip = () => {
		if (numSkips >= currentRoom.settings.maxSkips) {
			return;
		}

		setLoadingClue(true);
		setIsOkDisabled(true);
		setIsSkipDisabled(true);
		setNumSkips(numSkips + 1);
		socket.emit('RETRIEVE_CLUE', { roomId: currentRoom.id, categorySlug: currentCategorySlug });
	};

	if (loading) {
		return (
			<div className="spinner" />
		);
	}

	if (isActive) {
		if (!currentRoom.currentClue) {
			return null;
		}

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

				<p className="highlight" id="clue">{loadingClue ? '...' : clue.name}</p>

				{clue.img && !loadingClue ? (
					<p>
						<img alt="" height={clue.height} src={clue.img} width={clue.width} />
					</p>
				) : null}

				<p>
					<button disabled={isOkDisabled} onClick={onNext} type="button">Okay, let&rsquo;s do this</button>
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
				{`Waiting for ${getActivePlayer(currentRoom).name} to get a clue.`}
			</p>
		</section>
	);
}

Step2.propTypes = {
	currentCategorySlug: PropTypes.string,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	socket: PropTypes.object.isRequired,
};

Step2.defaultProps = {
	currentCategorySlug: '',
};
