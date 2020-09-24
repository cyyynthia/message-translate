/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, contextMenu: { closeContextMenu } } = require('powercord/webpack')
const { Menu } = require('powercord/components')

module.exports = React.memo(
  ({ openSettings, getSetting, toggleSetting }) => (
    <Menu.Menu navId='message-translate-quick-settings' onClose={closeContextMenu}>
      <Menu.MenuGroup id='toggles'>
        <Menu.MenuCheckboxItem
          id='sent'
          label='Translate Sent Messages'
          checked={getSetting('translate_sent_messages')}
          action={() => toggleSetting('translate_sent_messages')}
        />
        <Menu.MenuCheckboxItem
          id='received'
          label='Translate Received Messages'
          checked={getSetting('translate_received_messages')}
          action={() => toggleSetting('translate_received_messages')}
        />
      </Menu.MenuGroup>
      <Menu.MenuGroup id='settings'>
        <Menu.MenuItem
          id='open-settings'
          label='Open Settings'
          action={() => openSettings()}
        />
      </Menu.MenuGroup>
    </Menu.Menu>
  )
)
