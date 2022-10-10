// Select category
import { capitalize, getActivePlayer, isActivePlayer } from './Helpers';
import React, { useState } from 'react';
import GameOver from './GameOver';
import PropTypes from 'prop-types';

export default function Step1({
	categories,
	currentPlayer,
	currentRoom,
	setScreen,
	socket,
}) {
	const [loading, setLoading] = useState(false);

	if (!categories) {
		// Categories have not loaded yet.
		return null;
	}

	const categoryList = categories.filter((category) => (
		category.count > currentRoom.categoryCount[category.slug]
	));

	if (categoryList.length <= 0) {
		return (
			<GameOver
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				setScreen={setScreen}
				socket={socket}
			/>
		);
	}

	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const onClickCategory = (e) => {
		setLoading(true);
		const categorySlug = e.target.getAttribute('data-category');
		socket.emit('PICK_CATEGORY', { roomId: currentRoom.id, categorySlug });
	};

	if (loading) {
		return (
			<div className="spinner" />
		);
	}

	if (isActive) {
		return (
			<section>
				<h1>It&rsquo;s your turn!</h1>

				<p>Pick a category:</p>

				<p id="category-list">
					{categoryList.map((category) => (
						<button
							className={`icon category-${category.slug}`}
							data-category={category.slug}
							key={category.id}
							onClick={onClickCategory}
							type="button"
						/>
					))}
				</p>

				<p className="no-margin">
					<button onClick={onClickCategory} type="button">Random</button>
				</p>
			</section>
		);
	}

	return (
		<section>
			<p className="wait">
				{`Waiting for ${getActivePlayer(currentRoom).name} to pick a category.`}
			</p>
		</section>
	);
}

Step1.propTypes = {
	categories: PropTypes.array.isRequired,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	setScreen: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
