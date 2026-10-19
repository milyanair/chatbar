# Changelog

## 1.2.0
- New context menu on the Chat Bar header: Minimize or Expand, Move to the other side, Open in Talk, Chat Bar settings, and Close for now (hides the bar until the page is reloaded; nothing is saved)
- Opens with a right-click, the Menu key or Shift+F10 on the focused header, or a touch long-press (about 500 ms). Arrow keys, Home, End, Enter and Escape work; ARIA menu roles for screen readers
- The header can now be reached with Tab
- Your own messages in the expanded view are now easy to read in light and dark mode (they were very faint before)

## 1.1.2
- Made clear that Chat Bar requires Nextcloud Talk (spreed): store description, README (new Requirements section) and app description
- Admin settings show a warning when Talk is not enabled; the bar stays hidden and no scripts load (no errors)

## 1.1.1
- Compatibility: Nextcloud 32 to 35 (tested on 32.0.15, 33.0.10 and 35.0.2)
- Default Notify (unread badge) color is now #db3939 (previously the theme error color). Personal and admin choices are unchanged.

## 1.1.0
- Personal colors in the Chat Bar settings: **Action** (header gradient and buttons) and **Notify** (unread badge, white text)
- "Reset to default" returns to the theme colors (or the admin defaults)
- Optional admin default colors
- Colors apply live without a reload, including other open tabs

## 1.0.0
- First release as **Chat Bar**, generalized from an internal prototype ("floatchat")
- Gradient header (theming primary color) as the drag handle; 36 px expand/collapse button
- Last-message preview in the collapsed bar; unread badge; flash and browser notifications
- Admin setting: all users or selected groups. Personal setting: hide the bar
- Hidden when Talk is not enabled; translatable strings; light and dark mode
- Migrates a saved bar position from the prototype
