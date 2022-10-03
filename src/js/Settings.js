import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Settings({ addToast, categories, currentPlayer, currentRoom, methods, setIsSettingsVisible, settings, socket }) {
	const [loading, setLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [playerCategories, setCategories] = useState(settings.categories);
	const [playerMethods, setMethods] = useState(settings.methods);
	const [maxYear, setMaxYear] = useState(settings.maxYear);
	const [minYear, setMinYear] = useState(settings.minYear);

	// TODO: Force choosing at least one category and method, setting all min/max years, validate min is before max.

	const onChangeCategory = (e) => {
		if (e.target.checked) {
			setCategories([...playerCategories, e.target.value]);
		} else {
			const newCategories = [...playerCategories];
			newCategories.splice(playerCategories.indexOf(e.target.value), 1);
			setCategories(newCategories);
		}
	};

	const onChangeMethod = (e) => {
		if (e.target.checked) {
			setMethods([...playerMethods, e.target.value]);
		} else {
			const newMethods = [...playerMethods];
			newMethods.splice(playerMethods.indexOf(e.target.value), 1);
			setMethods(newMethods);
		}
	};

	const onChangeMaxYear = (e) => {
		const category = e.target.getAttribute('data-category');
		setMaxYear({ ...maxYear, [category]: e.target.value });
	};

	const onChangeMinYear = (e) => {
		const category = e.target.getAttribute('data-category');
		setMinYear({ ...minYear, [category]: e.target.value });
	};

	const submit = (e) => {
		e.preventDefault();
		setIsDisabled(true);
		setLoading(true);
		socket.emit('SAVE_SETTINGS', {
			code: currentRoom.code,
			id: currentPlayer.id,
			settings: {
				categories: playerCategories,
				methods: playerMethods,
				maxYear,
				minYear,
			},
		});
	};

	const onCancel = () => {
		setIsSettingsVisible(false);
	};

	useEffect(() => {
		socket.on('ERROR_SAVE_SETTINGS', () => {
			setIsDisabled(false);
			setLoading(false);
			addToast('Error saving settings.');
		});
	}, []);

	return (
		<form id="modal" onSubmit={submit}>
			{loading && <div className="spinner" />}

			<h1>Settings</h1>

			<button className="icon" id="modal-close" onClick={onCancel} type="button">Close</button>

			<h2>Categories</h2>

			<ul className="checkbox-list">
				{categories.map((category) => {
					const checked = playerCategories.includes(category.slug);
					return (
						<li className="checkbox-list__item" key={category.id}>
							<label className="checkbox-list__label">
								<input
									checked={checked}
									name="categories[]"
									onChange={onChangeCategory}
									type="checkbox"
									value={category.slug}
								/>
								<span>{category.plural}</span>
							</label>
						</li>
					);
				})}
			</ul>

			<p className="setting-title">Actions</p>

			<ul className="checkbox-list">
				{methods.map((method) => {
					const checked = playerMethods.includes(method.slug);
					return (
						<li className="checkbox-list__item" key={method.id}>
							<label className="checkbox-list__label">
								<input
									checked={checked}
									name="methods[]"
									onChange={onChangeMethod}
									type="checkbox"
									value={method.slug}
								/>
								<span>{method.name}</span>
							</label>
						</li>
					);
				})}
			</ul>

			<table>
				<thead>
					<tr>
						<th />
						<th scope="col">From</th>
						<th scope="col">To</th>
					</tr>
				</thead>
				<tbody>
					{categories.filter((category) => (category.minYear > 0)).map((category) => (
						<tr key={category.id}>
							<th>
								<label className="label--inline" htmlFor={`min-year-${category.slug}`}>
									{category.plural}
								</label>
							</th>
							<td>
								<input
									data-category={category.slug}
									id={`min-year-${category.slug}`}
									min={category.minYear}
									max={category.maxYear}
									maxLength={4}
									onChange={onChangeMinYear}
									size={5}
									type="number"
									value={minYear[category.slug]}
								/>
							</td>
							<td>
								<input
									data-category={category.slug}
									id={`max-year-${category.slug}`}
									min={category.minYear}
									max={category.maxYear}
									maxLength={4}
									onChange={onChangeMaxYear}
									size={5}
									type="number"
									value={maxYear[category.slug]}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<p>
				<button disabled={isDisabled} type="submit">Save</button>
			</p>
		</form>
	);
}

Settings.propTypes = {
	addToast: PropTypes.func.isRequired,
	categories: PropTypes.array.isRequired,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	methods: PropTypes.array.isRequired,
	settings: PropTypes.object.isRequired,
	setIsSettingsVisible: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
