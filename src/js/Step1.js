// Select category
import { capitalize, getActivePlayer, isActivePlayer } from './Helpers';
import PropTypes from 'prop-types';
import React from 'react';

export default function Step1({
	categories,
	currentPlayer,
	currentRoom,
	retrieveClue,
	socket,
}) {
	if (!categories) {
		// Categories have not loaded yet.
		return null;
	}

	const categoryList = categories.filter((category) => (
		category.count > currentRoom.categoryCount[category.slug]
	));

	if (categoryList.length <= 0) {
		return (
			<section>
				<h1>There are no more questions</h1>
				<p>...congratulations?</p>
			</section>
		);
	}

	const activePlayer = getActivePlayer(currentRoom);
	const isActive = isActivePlayer(currentRoom, currentPlayer);

	const onClickCategory = (e) => {
		const categorySlug = e.target.getAttribute('data-category');
		socket.emit('PICK_CATEGORY', { code: currentRoom.code, categorySlug });
		retrieveClue(categorySlug);
	};

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
						>
							{capitalize(category.name)}
						</button>
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
				{`Waiting for ${activePlayer.name} to pick a category.`}
			</p>
		</section>
	);
}

Step1.propTypes = {
	categories: PropTypes.array.isRequired,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	retrieveClue: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
