import './css/style.css';
import App from './js/App.jsx';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

const root = createRoot(document.getElementById('root'));
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
