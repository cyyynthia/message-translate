/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, contextMenu: { closeContextMenu }, i18n: { Messages } } = require('powercord/webpack')
const { Menu } = require('powercord/components')

module.exports = React.memo(
  ({ openSettings, getSetting, toggleSetting }) => (
    <Menu.Menu navId='message-translate-quick-settings' onClose={closeContextMenu}>
      <Menu.MenuGroup id='toggles'>
        <Menu.MenuCheckboxItem
          id='sent'
          label={Messages.TRANSLATE_SENT_MESSAGES}
          checked={getSetting('translate_sent_messages')}
          action={() => toggleSetting('translate_sent_messages')}
        />
        <Menu.MenuCheckboxItem
          id='received'
          label={Messages.TRANSLATE_RECEIVED_MESSAGES}
          checked={getSetting('translate_received_messages')}
          action={() => toggleSetting('translate_received_messages')}
        />
      </Menu.MenuGroup>
      <Menu.MenuGroup id='settings'>
        <Menu.MenuItem
          id='open-settings'
          label={Messages.OPEN_SETTINGS}
          action={() => openSettings()}
        />
      </Menu.MenuGroup>
    </Menu.Menu>
  )
)
