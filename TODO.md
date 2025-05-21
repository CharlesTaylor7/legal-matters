## Infra / ops
- [x] setup neon
- [x] Decomission vercel
- [x] setup fly.io
- [x] get .env working with server + ef + docker
- [x] CI/CD for github actions to deploy
- [x] Get local docker setup working

## Backend
- [x] Init Backend
- [x] Setup database schema
- [x] authentication api routes
- [x] Doublecheck swagger docs
- [x] Implement customer API routes as authenticated routes
- [x] Implement matter API routes as authenticated routes
- [ ] Dedicated response objects for each controller route
  - we have to do this because the AI is returning in models in some cases, and swagger is not picking up the docs

- [ ] QA whole thing with swagger ui
    - playwright maybe?


## Frontend
- [x] Init frontend - vite
- [x] Home page greets the user
- [x] Set favicon to the justice scales emoji
- [x] Navbar
  - [x] render into app page
  - [x] ensure all pages load the api/auth/me route to check logged in status
  - [x] highlight active page
  - [x] USe Activeclassname menu-active
  - [x] Mobile site, the hamburger menu and logout button should be in the same row as the page title.
  
- [x] redo the api files based on the c# controllers.
- [] review and revise error handling
- [ ] Build Customers UI
- [ ] Build Matters  UI



## nice to have
- [ ] Auto populate swagger examples with valid values
- [ ] Fixup CI/CD
  - [ ] Confirmation on the logout button?

## UI Tweaks
- logout button is not aligned to navigtation items
- login/signup Input box highlight overlaps label text. Removed focused style?
