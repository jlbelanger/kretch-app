import React, { useEffect, useRef } from 'react'; // eslint-disable-line import/no-unresolved
import PropTypes from 'prop-types';

export default function Modal({
	cancelable,
	children,
	event,
	onClickCancel,
}) {
	const dialogRef = useRef(null);

	const onKeydown = (e) => {
		if (e.key === 'Escape' && onClickCancel) {
			onClickCancel();
		}
	};

	const onClickDialog = (e) => {
		if (e.target.tagName === 'DIALOG' && onClickCancel) {
			onClickCancel();
		}
	};

	useEffect(() => {
		document.body.classList.add('modal-open');

		if (cancelable) {
			document.addEventListener('keydown', onKeydown);
		}

		return () => {
			document.body.classList.remove('modal-open');

			if (cancelable) {
				document.removeEventListener('keydown', onKeydown);
			}

			if (event.target) {
				event.target.focus();
			}
		};
	}, []);

	useEffect(() => {
		if (dialogRef && dialogRef.current && dialogRef.current.getAttribute('open') === null) {
			dialogRef.current.showModal();
			dialogRef.current.focus();

			if (cancelable) {
				dialogRef.current.addEventListener('click', onClickDialog);
			}
		}
	}, [dialogRef]);

	return (
		<dialog className="modal" ref={dialogRef} tabIndex={-1}>
			{children}
		</dialog>
	);
}

Modal.propTypes = {
	cancelable: PropTypes.bool,
	children: PropTypes.node,
	event: PropTypes.object.isRequired,
	onClickCancel: PropTypes.func,
};

Modal.defaultProps = {
	cancelable: true,
	children: null,
	onClickCancel: null,
};