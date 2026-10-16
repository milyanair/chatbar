# Changelog

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
