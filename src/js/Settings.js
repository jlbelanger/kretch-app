import React, { useEffect, useState } from 'react';
import Modal from './Components.js/Modal';
import PropTypes from 'prop-types';

export default function Settings({
	addToast,
	categories,
	currentPlayer,
	currentRoom,
	event,
	methods,
	setIsSettingsVisible,
	settings,
	socket,
}) {
	const [loading, setLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [playerCategories, setCategories] = useState(settings.categories);
	const [playerMethods, setMethods] = useState(settings.methods);
	const [maxYear, setMaxYear] = useState(settings.maxYear);
	const [minYear, setMinYear] = useState(settings.minYear);
	const [categoriesError, setCategoriesError] = useState('');
	const [actionsError, setActionsError] = useState('');
	const [yearsFieldsWithErrors, setYearsFieldsWithErrors] = useState([]);
	const [yearsErrors, setYearsErrors] = useState({});

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
		setMaxYear({ ...maxYear, [category]: e.target.value.trim() });
	};

	const onChangeMinYear = (e) => {
		const category = e.target.getAttribute('data-category');
		setMinYear({ ...minYear, [category]: e.target.value.trim() });
	};

	const submit = (e) => {
		e.preventDefault();

		let isValid = true;

		if (playerCategories.length <= 0) {
			setCategoriesError('Please choose at least one category.');
			isValid = false;
		} else {
			setCategoriesError('');
		}

		if (playerMethods.length <= 0) {
			setActionsError('Please choose at least one action.');
			isValid = false;
		} else {
			setActionsError('');
		}

		const newYearsErrors = {};
		const newYearsFieldsWithErrors = [];
		Object.keys(minYear).forEach((category) => {
			if (!minYear[category] || /[^0-9]/.test(minYear[category])) {
				newYearsErrors[category] = 'Invalid year.';
				newYearsFieldsWithErrors.push(`${category}.min`);
				isValid = false;
			} else if (minYear[category] > settings.maxYear[category]) {
				newYearsErrors[category] = `From year must be at least ${settings.maxYear[category]}.`;
				newYearsFieldsWithErrors.push(`${category}.min`);
				isValid = false;
			} else if (!maxYear[category] || /[^0-9]/.test(maxYear[category])) {
				newYearsErrors[category] = 'Invalid year.';
				newYearsFieldsWithErrors.push(`${category}.max`);
				isValid = false;
			} else if (parseInt(minYear[category], 10) > parseInt(maxYear[category], 10)) {
				newYearsErrors[category] = 'From must be before to.';
				newYearsFieldsWithErrors.push(`${category}.min`);
				newYearsFieldsWithErrors.push(`${category}.max`);
				isValid = false;
			} else {
				newYearsErrors[category] = '';
			}
		});
		setYearsErrors(newYearsErrors);
		setYearsFieldsWithErrors(newYearsFieldsWithErrors);

		if (!isValid) {
			addToast('Error saving settings.');
			return;
		}

		setIsDisabled(true);
		setLoading(true);
		socket.emit('SAVE_SETTINGS', {
			roomId: currentRoom.id,
			playerId: currentPlayer.id,
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
		document.body.classList.add('modal-open');

		return () => {
			document.body.classList.remove('modal-open');
		};
	}, []);

	return (
		<Modal event={event} onClickCancel={onCancel}>
			<form onSubmit={submit}>
				{loading && <div className="spinner" role="status">Loading...</div>}

				<h1>Settings</h1>

				<button aria-label="Close settings" className="icon" id="modal-close" onClick={onCancel} type="button">
					<span aria-hidden="true">Close</span>
				</button>

				<fieldset>
					<legend>Random Categories</legend>

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
				</fieldset>

				<p aria-live="polite" className="field-error" role="alert">{categoriesError}</p>

				<fieldset>
					<legend>Actions</legend>

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
				</fieldset>

				<p aria-live="polite" className="field-error" role="alert">{actionsError}</p>

				<fieldset>
					<legend>Year Ranges</legend>

					<table>
						<thead>
							<tr aria-hidden>
								<th />
								<th scope="col">From</th>
								<th scope="col">To</th>
							</tr>
						</thead>
						<tbody>
							{categories.filter((category) => (category.minYear > 0)).map((category) => {
								const hasMinYearError = yearsFieldsWithErrors.includes(`${category.slug}.min`);
								const hasMaxYearError = yearsFieldsWithErrors.includes(`${category.slug}.max`);
								return (
									<React.Fragment key={category.id}>
										<tr>
											<th aria-hidden>
												<label className="label--inline" htmlFor={`min-year-${category.slug}`}>
													{category.plural}
												</label>
											</th>
											<td>
												<div
													aria-label={`${category.plural} minimum year`}
													className={hasMinYearError ? 'field__input-wrapper--invalid' : ''}
												>
													<input
														data-category={category.slug}
														id={`min-year-${category.slug}`}
														inputMode="numeric"
														maxLength={4}
														onChange={onChangeMinYear}
														size={5}
														type="text"
														value={minYear[category.slug]}
													/>
												</div>
											</td>
											<td>
												<div
													aria-label={`${category.plural} maximum year`}
													className={hasMaxYearError ? 'field__input-wrapper--invalid' : ''}
												>
													<input
														data-category={category.slug}
														id={`max-year-${category.slug}`}
														inputMode="numeric"
														maxLength={4}
														onChange={onChangeMaxYear}
														size={5}
														type="text"
														value={maxYear[category.slug]}
													/>
												</div>
											</td>
										</tr>
										{yearsErrors[category.slug] && (
											<tr>
												<td colSpan={3}>
													<div aria-live="polite" className="field-error" role="alert">{yearsErrors[category.slug]}</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								);
							})}
						</tbody>
					</table>
				</fieldset>

				<p>
					<button aria-label="Save settings" disabled={isDisabled} type="submit">
						<span aria-hidden="true">Save</span>
					</button>
				</p>
			</form>
		</Modal>
	);
}

Settings.propTypes = {
	addToast: PropTypes.func.isRequired,
	categories: PropTypes.array.isRequired,
	currentPlayer: PropTypes.object.isRequired,
	currentRoom: PropTypes.object.isRequired,
	event: PropTypes.object.isRequired,
	methods: PropTypes.array.isRequired,
	settings: PropTypes.object.isRequired,
	setIsSettingsVisible: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
};
