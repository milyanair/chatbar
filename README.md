# Chat Bar for Nextcloud

A floating, draggable chat bar for **Nextcloud Talk** on every Nextcloud page.

> **Requires Nextcloud Talk (spreed).** Install and enable Talk before enabling Chat Bar.

- Unread badge, last-message preview (sender, 2 lines, relative time) and a quick reply field
- Expands to the last 10 messages of the selected conversation
- Flashes and shows a browser notification (when permitted) on new messages
- Drag it by its header; the position is remembered per user and browser
- Uses the instance theming colors and works in light and dark mode
- Hidden on the Talk app itself, inside iframes and on screens narrower than 640 px

## Requirements
- Nextcloud 32 to 35
- **Nextcloud Talk (spreed)**, installed and enabled. Chat Bar uses the Talk API of your own server and has no chat backend of its own.
- Talk must be enabled for each user who should see the bar (if Talk is limited to groups, Chat Bar follows that).

Without Talk, Chat Bar does nothing harmful: the bar is not rendered, no scripts are loaded, users see a short note in Personal settings and admins see a warning in Administration settings > Chat Bar. The Nextcloud app store schema has no way to declare a dependency on another app, so this is checked at runtime.

## Settings
- **Administration settings → Chat Bar:** show to all users (default) or only to selected groups.
- **Personal settings → Chat Bar:** each user can hide the bar and pick an **Action** color (header and buttons) and a **Notify** color (unread badge), with a reset to the defaults.
- Admins can also set default colors.

## How it works
Plain JavaScript, no build step. It polls the Talk OCS API (`/ocs/v2.php/apps/spreed/api/v4/room` and `.../v1/chat/<token>`) with the user's browser session: every 15 s when expanded and 45 s when collapsed, paused while the tab is hidden. It does not embed the Talk UI.

## Install (manual)
```
cp -r chatbar /var/www/html/custom_apps/
occ app:enable chatbar
```
To turn it off: `occ app:disable chatbar`

## Build
`make dist` creates `build/chatbar-<version>.tar.gz`. `make sign` adds an app-store signature, if your key is available.

## License
AGPL-3.0-or-later
