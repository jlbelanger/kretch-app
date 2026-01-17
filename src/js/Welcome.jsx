import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Welcome({ socket }) {
	const [name, setName] = useState(window.localStorage.getItem('name') || '');
	const [code, setCode] = useState('');
	const [nameError, setNameError] = useState('');
	const [codeError, setCodeError] = useState('');
	const [loading, setLoading] = useState(false);

	const onInvalidRoom = () => {
		setCodeError('This room does not exist.');
		setLoading(false);
	};

	const onNoRoom = () => {
		setCodeError('There are no more rooms available.');
		setLoading(false);
	};

	useEffect(() => {
		socket.on('ERROR_INVALID_ROOM', onInvalidRoom);
		socket.on('ERROR_NO_ROOM', onNoRoom);

		return () => {
			socket.off('ERROR_INVALID_ROOM', onInvalidRoom);
			socket.off('ERROR_NO_ROOM', onNoRoom);
		};
	}, []);

	const joinRoom = () => {
		let isValid = true;

		if (name) {
			setNameError('');
		} else {
			setNameError('Please enter your name.');
			isValid = false;
		}

		if (code) {
			setCodeError('');
		} else {
			setCodeError('Please enter a room code.');
			isValid = false;
		}

		if (!isValid) {
			return;
		}

		window.localStorage.setItem('name', name);
		setLoading(true);
		socket.emit('JOIN_ROOM', { name, code });
	};

	const createRoom = () => {
		let isValid = true;

		if (name) {
			setNameError('');
		} else {
			setNameError('Please enter your name.');
			isValid = false;
		}

		setCodeError('');

		if (!isValid) {
			return;
		}

		window.localStorage.setItem('name', name);
		setLoading(true);
		socket.emit('CREATE_ROOM', { name });
	};

	const onSubmit = (e) => {
		e.preventDefault();
		if (code) {
			joinRoom();
		} else {
			createRoom();
		}
	};

	return (
		<form className="mini" onSubmit={onSubmit}>
			{loading ? (
				<div className="spinner" role="status">
					Loading...
				</div>
			) : null}

			<h1>Kretch</h1>

			<div className="field">
				<label htmlFor="name">Name:</label>
				<div className={`field__input-wrapper${nameError ? ' field__input-wrapper--invalid' : ''}`}>
					<input
						autoFocus="autofocus"
						id="name"
						maxLength={16}
						onChange={(e) => setName(e.target.value.trim())}
						type="text"
						value={name}
					/>
				</div>
			</div>

			<div aria-live="polite" className="field-error" role="alert">
				{nameError}
			</div>

			<div className="field">
				<label htmlFor="code">Room:</label>
				<div className={`field__input-wrapper${codeError ? ' field__input-wrapper--invalid' : ''}`}>
					<input
						autoComplete="off"
						id="code"
						maxLength={4}
						onChange={(e) => setCode(e.target.value.trim())}
						type="text"
						value={code}
					/>
					<button onClick={joinRoom} type="button">Join</button>
				</div>
			</div>

			<div aria-live="polite" className="field-error" role="alert">
				{codeError}
			</div>

			<p className="flex">
				<label>or</label>
				<button onClick={createRoom} type="button">Create new room</button>
			</p>

			<button aria-hidden className="hide" type="submit" />
		</form>
	);
}

Welcome.propTypes = {
	socket: PropTypes.object.isRequired,
};
