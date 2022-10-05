import React, { useEffect, useState } from 'react';
import GameOver from './GameOver';
import io from 'socket.io-client';
import { isActivePlayer } from './Helpers';
import Room from './Room';
import Settings from './Settings';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Welcome from './Welcome';

export default function App() {
	const [socket, setSocket] = useState(null);
	const [screen, setScreen] = useState('welcome');
	const [categories, setCategories] = useState([]);
	const [currentCategorySlug, setCurrentCategorySlug] = useState(null);
	const [currentPlayer, setCurrentPlayer] = useState(null);
	const [settings, setSettings] = useState({});
	const [currentRoom, setCurrentRoom] = useState(null);
	const [methods, setMethods] = useState([]);
	const [toasts, setToasts] = useState({});
	const [isSettingsVisible, setIsSettingsVisible] = useState(false);

	const removeToast = (toastId) => {
		if (Object.prototype.hasOwnProperty.call(toasts, toastId)) {
			const newToasts = { ...toasts };
			delete newToasts[toastId];
			setToasts(newToasts);
		}
	};

	const addToast = (text, milliseconds = 5000) => {
		const toastId = new Date().getTime();
		setToasts({
			...toasts,
			[toastId]: {
				text,
				milliseconds,
			},
		});
		setTimeout(() => {
			removeToast(toastId);
		}, milliseconds);
	};

	useEffect(() => {
		const s = io(process.env.REACT_APP_API_URL, { path: `${process.env.REACT_APP_API_PATH}/socket.io` });

		s.on('JOINED_ROOM', (data) => {
			console.log('JOINED_ROOM', data);
			setCategories(data.categories);
			setCurrentPlayer(data.player);
			setSettings(data.player.settings); // TODO: Separate player and settings in api.
			setCurrentRoom(data.room);
			setMethods(data.methods);
			setScreen('room');
		});

		s.on('ADDED_PLAYER', (data) => {
			console.log('ADDED_PLAYER', data);
			setCurrentRoom(data.room);
			addToast(`${data.playerName} has joined.`);
		});

		s.on('REMOVED_PLAYER', (data) => {
			console.log('REMOVED_PLAYER', data);
			setCurrentRoom(data.room);
			addToast(`${data.playerName} has left.`);
		});

		s.on('STARTED_GAME', (data) => {
			console.log('STARTED_GAME', data);
			setCurrentRoom(data.room);
			setScreen('step-1');
		});

		s.on('SAVED_SETTINGS', (data) => {
			console.log('SAVED_SETTINGS', data);
			const comments = ['Settings saved.'];
			if (data.settings.maxYear.song < '2019') {
				comments.push(`So you stopped being cool in ${data.settings.maxYear.song}. Got it.`);
			}
			if (data.settings.maxYear.song < '2000') {
				comments.push('Okay, grandma.');
			}
			if (data.settings.minYear.song > '1970') {
				comments.push('Whippersnapper.');
				comments.push('Get off my lawn.');
			}
			const num = comments.length;
			const message = comments[Math.floor(Math.random() * num)];

			setSettings(data.settings);
			setIsSettingsVisible(false);
			addToast(message);
		});

		s.on('PICKED_CATEGORY', (data) => {
			console.log('PICKED_CATEGORY', data);
			setCurrentCategorySlug(data.categorySlug);
			setCurrentRoom(data.room);
			setScreen('step-2');
		});

		s.on('RETRIEVED_CLUE', (data) => {
			console.log('RETRIEVED_CLUE', data);
			setCurrentRoom(data.room);
		});

		s.on('PICKED_CLUE', (data) => {
			console.log('PICKED_CLUE', data);
			setCurrentRoom(data.room);
			setScreen('step-3');
		});

		s.on('COMPLETED_CLUE', (data) => {
			console.log('COMPLETED_CLUE', data);
			setCurrentRoom(data.room);
			setScreen('step-4');
		});

		s.on('CHANGED_PLAYER', (data) => {
			console.log('CHANGED_PLAYER', data);
			setCurrentRoom(data.room);
			setScreen('step-1');
		});

		s.on('ERROR_NO_CLUES', () => {
			console.log('ERROR_NO_CLUES');
			setScreen('game-over');
		});

		setSocket(s);

		return () => {
			s.disconnect();
		};
	}, []);

	if (!socket) {
		return null;
	}

	const retrieveClue = (categorySlug) => {
		if (isActivePlayer(currentRoom, currentPlayer)) {
			socket.emit('RETRIEVE_CLUE', { code: currentRoom.code, categorySlug });
		}
	};

	let screenComponent = null;
	if (isSettingsVisible) {
		screenComponent = (
			<Settings
				addToast={addToast}
				categories={categories}
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				methods={methods}
				setIsSettingsVisible={setIsSettingsVisible}
				settings={settings}
				socket={socket}
			/>
		);
	} else if (screen === 'welcome') {
		screenComponent = (
			<Welcome socket={socket} />
		);
	} else if (screen === 'room') {
		screenComponent = (
			<Room
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				setScreen={setScreen}
				socket={socket}
			/>
		);
	} else if (screen === 'game-over') {
		screenComponent = (
			<GameOver />
		);
	} else {
		const components = [
			Step1,
			Step2,
			Step3,
			Step4,
		];
		const Component = components[currentRoom.step - 1];

		screenComponent = (
			<>
				<header id="header">
					<div id="room-code">{currentRoom.code}</div>
					<button className="icon" id="settings-button" onClick={() => { setIsSettingsVisible(true); }} type="button">Settings</button>
				</header>
				<Component
					categories={categories}
					currentCategorySlug={currentCategorySlug}
					currentPlayer={currentPlayer}
					currentRoom={currentRoom}
					retrieveClue={retrieveClue}
					setScreen={setScreen}
					socket={socket}
				/>
			</>
		);
	}

	return (
		<main className={isSettingsVisible ? 'modal-open' : ''} id="main">
			{screenComponent}
			<div className="toast-container">
				{Object.keys(toasts).map((id) => (
					<div className="toast" key={id} style={{ animationDuration: `${toasts[id].milliseconds}ms` }}>
						{toasts[id].text}
					</div>
				))}
			</div>
		</main>
	);
}
