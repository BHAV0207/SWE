# City News & Alerts (React Native + Expo)

A city-focused news reader with saved articles and emergency alerts. The UI is a light, soft card look to reduce similarity with common templates.

## Features

- City picker with quick-pick chips
- Curated news feed per city (GNews API)
- In-app WebView reader with save/remove
- Bookmarks list with swipe/tap navigation
- Emergency alerts list from local JSON data
- Pull-to-refresh on the feed

## Tech Stack

- React Native (Expo)
- React Navigation (native stack)
- Axios for API calls
- AsyncStorage for bookmarks
- React Native WebView

## Setup

1.  Install deps

```bash
npm install
```

2.  Add env

```bash
echo "GNEWS_API_KEY=your_api_key" > .env
```

3.  Run

```bash
npx expo start
```

## Project Structure

```
newsapp/
├── App.js                 # Navigation + screens
├── app.config.js          # Expo config (dark mode palette set here)
├── theme.js               # Centralized light palette + radii/spacing
├── screens/               # UI screens
│   ├── CitySelectorScreen.js
│   ├── NewsFeedScreen.js
│   ├── NewsWebViewScreen.js
│   ├── BookmarksScreen.js
│   └── EmergencyAlertsScreen.js
├── data/                  # Static JSON for alerts & popular cities
└── assets/                # App icons and splash
```

## Environment

- GNEWS_API_KEY is required for live news.
- Uses portrait orientation; UI tuned for light theme (see `theme.js`).

## Notes

- Bookmarks persist locally via AsyncStorage.
- Feed cards include a placeholder when an article has no image.
- Styling uses shared radii/spacing from `theme.js` to keep the look cohesive.

## Future improvements

- Add pagination/infinite scroll
- Add offline cache for last-read articles
- Add category filters per city
