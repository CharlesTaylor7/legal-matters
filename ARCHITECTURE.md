# UK Tax Calculator - Architecture

## Overview

This is a UK Tax Calculator built with Angular 19 & .NET 9. It allows users to calculate income tax based on a marginal tax system.

It also allows the user to input their own tax rule set for use with the calculator.

## Technical Stack

Frontend: Angular, Typescript
Backened: ASP.NET Core, C#, Postgresql

E2E testing: Playwright
Backend Unit Testing: xUnit
Frontend unit tests were cut for time, but would probably setup jest if needed to.

I'm not using any runtime libraries beyond that. 
No component libraries, just hand rolled css with [BEM](https://getbem.com/) methodology for styling.

