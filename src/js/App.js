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

const socket = io(process.env.REACT_APP_API_URL, {
	path: `${process.env.REACT_APP_API_PATH}/socket.io`,
	closeOnBeforeunload: false,
});

export default function App() {
	const [isConnected, setIsConnected] = useState(socket.connected);
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
		setToasts((oldToasts) => {
			const newToasts = { ...oldToasts };
			if (Object.prototype.hasOwnProperty.call(newToasts, toastId)) {
				delete newToasts[toastId];
			}
			return newToasts;
		});
	};

	const addToast = (text, milliseconds = 5000) => {
		const toastId = new Date().getTime();
		setToasts((oldToasts) => ({
			...oldToasts,
			[toastId]: {
				text,
				milliseconds,
			},
		}));
		setTimeout(() => {
			removeToast(toastId);
		}, milliseconds);
	};

	const onBeforeUnload = () => {
		socket.disconnect();
	};

	const onRetrievedClue = (data) => {
		setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
	};

	useEffect(() => {
		socket.on('connect', () => {
			setIsConnected(true);
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
		});

		socket.on('JOINED_ROOM', (data) => {
			setCategories(data.categories);
			setCurrentPlayer(data.player);
			setSettings(data.player.settings);
			setCurrentRoom(data.room);
			setMethods(data.methods);
			if (data.room.step) {
				setScreen(`step-${data.room.step}`);
			} else {
				setScreen('room');
			}
		});

		socket.on('ADDED_PLAYER', (data) => {
			addToast(`${data.playerName} has joined.`);
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
		});

		socket.on('REMOVED_PLAYER', (data) => {
			addToast(`${data.playerName} has left.`);
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
		});

		socket.on('STARTED_GAME', (data) => {
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
			setScreen('step-1');
		});

		socket.on('SAVED_SETTINGS', (data) => {
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

			addToast(message);
			setSettings(data.settings);
			setIsSettingsVisible(false);
		});

		socket.on('PICKED_CATEGORY', (data) => {
			setCurrentCategorySlug(data.categorySlug);
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
			setScreen('step-2');
			if (isActivePlayer(currentRoom, currentPlayer)) {
				socket.emit('RETRIEVE_CLUE', { roomId: currentRoom.id, categorySlug: data.categorySlug });
			}
		});

		socket.on('RETRIEVED_CLUE', onRetrievedClue);

		socket.on('PICKED_CLUE', (data) => {
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
			setScreen('step-3');
		});

		socket.on('COMPLETED_CLUE', (data) => {
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
			setScreen('step-4');
		});

		socket.on('CHANGED_PLAYER', (data) => {
			setCurrentRoom((oldRoom) => ({ ...oldRoom, ...data.room }));
			setScreen('step-1');
		});

		socket.on('ERROR_NO_CLUES', () => {
			setScreen('game-over');
		});

		socket.on('ERROR_DELETED_ROOM', () => {
			addToast('This room no longer exists.');
			setScreen('welcome');
			setIsSettingsVisible(false);
		});

		socket.on('ERROR_DELETED_PLAYER', () => {
			addToast('You are no longer in that room.');
			setScreen('welcome');
			setIsSettingsVisible(false);
		});

		window.addEventListener('beforeunload', onBeforeUnload, { capture: true });

		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('JOINED_ROOM');
			socket.off('ADDED_PLAYER');
			socket.off('REMOVED_PLAYER');
			socket.off('STARTED_GAME');
			socket.off('SAVED_SETTINGS');
			socket.off('PICKED_CATEGORY');
			socket.off('RETRIEVED_CLUE', onRetrievedClue);
			socket.off('PICKED_CLUE');
			socket.off('COMPLETED_CLUE');
			socket.off('CHANGED_PLAYER');
			socket.off('ERROR_NO_CLUES');
			socket.off('ERROR_DELETED_ROOM');
			socket.off('ERROR_DELETED_PLAYER');
			window.removeEventListener('beforeunload', onBeforeUnload, { capture: true });
		};
	}, [currentRoom, currentPlayer]);

	if (!socket || !isConnected) {
		return (
			<div className="spinner" role="status">Connecting...</div>
		);
	}

	let screenComponent = null;
	if (isSettingsVisible) {
		screenComponent = (
			<Settings
				addToast={addToast}
				categories={categories}
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				event={isSettingsVisible}
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
				addToast={addToast}
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				setScreen={setScreen}
				socket={socket}
			/>
		);
	} else if (screen === 'game-over') {
		screenComponent = (
			<GameOver
				currentPlayer={currentPlayer}
				currentRoom={currentRoom}
				setScreen={setScreen}
				socket={socket}
			/>
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
					<div aria-label="Room code" id="room-code">{currentRoom.code}</div>
					<button className="icon" id="settings-button" onClick={(e) => { setIsSettingsVisible(e); }} type="button">Settings</button>
				</header>
				<Component
					categories={categories}
					currentCategorySlug={currentCategorySlug}
					currentPlayer={currentPlayer}
					currentRoom={currentRoom}
					setScreen={setScreen}
					socket={socket}
				/>
			</>
		);
	}

	return (
		<main aria-live="assertive" id="main" role="region">
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
