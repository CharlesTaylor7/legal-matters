# Tech Stack
I use React + C# at my dayjob, so I figured using what you know is a good idea.

## Backend

ASP.NET Core is pretty batteries included. 
Easy REST API w/ Swagger UI.
Easy Authentication/Identity/Role management.


### Login after signup
I missed this in my initial submission.
But I got this addressed on my refinements branch.



### Role Management
Two roles, admin & Lawyer.

Attribute based policies are possible with .NET, but I didn't pursue that. I just let the AI write manual queries for ownership in the controller methods.

Just for the sake of time.

## Frontend
### SSR considered but foregone
For simplicity sake, forego SSR.
The major react frameworks do support it (Next, Remix/React router, TanStack Start) but assume a node server. I don't want to juggle two backends.


### Routing
Using Client side SPA routing and /api routes mapping to the .NET Rest API.

React Router, in declaraative client-side only mode. (Does suppport SSR with the vite plugin)

With react router's nested <outlet /> component, we don't have to worry so much about full page rerenders and can just rerender the parts of the page that need to depend on the url.


### Styling
Tailwind helps move quickly but isn't a design system unto itself. So I pulled in DaisyUI which augments Tailwind with a design system. 

### State management
React Query

Many projects need global client state, in the form of Redux/Zustand etc.
I don't think this app is one of them.


React Query efficiently handles querying my REST API and caching responses that might be used on different pages. It sets up a context similar to Redux, but is focused on just managing asynchronous state from the server.
 
For other state, It made sense to either capture it in the url or in a local state hook.

If I needed global synchronous state across the app, that isn't url driven, that's the point I would add redux or zustand. 

