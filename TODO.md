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
- [x] Dedicated response objects for each controller route
  - we have to do this because the AI is returning in models in some cases, and swagger is not picking up the docs



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
  

## Required
- [ ] Build Customers UI
- [ ] Build Matters  UI
- [ ] review and revise client side handling



## nice to have
- [ ] RBAC policies
- [ ] playwright maybe
- [ ] Auto populate swagger examples with valid values
- [ ] Matter status should be text not enum, for the sake of swagger docs


## UI Tweaks
- logout button is not aligned to navigtation items
- login/signup Input box highlight overlaps label text. Removed focused style?

