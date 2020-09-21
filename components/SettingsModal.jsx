/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React } = require("powercord/webpack");
const { Button } = require("powercord/components");
const { Modal } = require("powercord/components/modal");
const { FormTitle } = require("powercord/components");
const { close: closeModal } = require("powercord/modal");
const Settings = require("./Settings");

class SettingsModal extends React.Component {
	render() {
		return (
			<Modal className="powercord-text" size={Modal.Sizes.LARGE}>
				<Modal.Header>
					<FormTitle tag="h4">Message Translate Settings</FormTitle>
					<Modal.CloseButton onClick={closeModal} />
				</Modal.Header>
				<Modal.Content>
					<Settings {...this.props}/>
				</Modal.Content>
				<Modal.Footer>
					<Button onClick={closeModal}>
						Close Settings
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

module.exports = SettingsModal;
