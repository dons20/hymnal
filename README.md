# Hymns for all Times

![Social Banner](./public/social_banner.jpg)

A modern, React + TypeScript progressive web app (PWA) for browsing and displaying hymns. It’s built with Mantine UI, React Router, Fuse.js (search), and localforage (offline storage), bundled with Vite. Dark mode is supported and adapts to your device preferences.

While this particular version is built with a specific object structure in mind (Songs), it is flexible enough to work with other setups, provided you update the types.

## Screenshots

Desktop — Light

![](<./promo/Desktop - Home (Light).png>)

![](<./promo/Desktop - Song List (Light).png>)

![](<./promo/Desktop - Song Display (Light).png>)

Desktop — Dark

![](<./promo/Desktop - Home (Dark).png>)

![](<./promo/Desktop - Song List (Dark).png>)

![](<./promo/Desktop - Song Display (Dark).png>)

Mobile (iPhone 12) — Light

![](<./promo/iPhone 12 - Home (Light).png>)

![](<./promo/iPhone 12 - Song List (Light).png>)

![](<./promo/iPhone 12 - Song Display (Light).png>)

Mobile (iPhone 12) — Dark

![](<./promo/iPhone 12 - Home (Dark).png>)

![](<./promo/iPhone 12 - Song List (Dark).png>)

![](<./promo/iPhone 12 - Song Display (Dark).png>)

## Copyright

I claim no ownership to any of the included song lyrics. If you are the copyright holder to any of these songs, and you'd like them to be removed, please open an issue or send me an email at keno@claytoninnovations.com.

This project will in no way seek any form of monetization and is just a fun side project.

## Contributing

If you have any suggestions feel free to open an issue!

## Development

Get started by ensuring you have an up-to-date version of Node.js (LTS recommended) with npm or yarn installed.

- `npm install` to install dependencies
- `npm run dev` - Launches the Vite development server
- `npm test` - Typechecks, lints, runs unit tests (Vitest), and builds
- `npm run build` - Builds the production app (see `build.sh`)
- `npm run preview` - Previews a production build locally
- `npm run analyze` - Analyzes the built bundle (after build)

Optional: Storybook is available for component development via `npm run storybook`.
