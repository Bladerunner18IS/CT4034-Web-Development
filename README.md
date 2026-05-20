# CT4034 Web Development – Bike Tracking & Theft Reporting System

### Overview
This project is an undergraduate coursework submission for the University of Gloucestershire (BSc Cybersecurity). It implements a full‑stack web application for registering bicycles, reporting thefts, and enabling police officers to manage and update case information. The system provides separate roles for users, police officers, and administrators, each with clearly defined permissions.

The application is built with a PHP API backend, a React frontend, and a MySQL database, all hosted on a single Apache instance. Security and access control were core priorities throughout the design.

**DEMO** - https://s4513209-ct4034.uogs.co.uk

### Features

- User registration and authentication using short‑lived access tokens and long‑lived refresh tokens.

- Bike registration with persistent storage in a MySQL database.

- Theft reporting allowing users to flag bikes as stolen.

- Police officer portal enabling authorised officers to update case details visible to the bike owner.

- Administrator role with the ability to register new police officers.

- API-first architecture allowing all functionality to be accessed via HTTP requests or command‑line tools such as curl.

- Component-based React frontend using react-router for client-side navigation.

### Security Model

Security was a primary focus of the project, with several measures implemented to protect user data and restrict access:

- JWT-based authentication

  - 30‑minute access tokens stored in JavaScript memory.

  - 24‑hour refresh tokens stored as secure, HTTP‑only, same-site cookies with path restrictions.

- Role-based access control

  - Users can manage their own bikes and theft reports.

  - Police officers can update cases but cannot modify unrelated user data.

  - Administrators can create new officer accounts.

- API isolation

  - Backend implemented as a pure PHP API with no server-side rendering.

  - All privileged actions require valid, role-appropriate tokens.

- Single Apache instance with strict routing

  - React frontend served from public paths.

  - API endpoints isolated under dedicated routes.

These measures collectively ensure that sensitive operations are protected and that authentication tokens are handled in a secure, industry-aligned manner.

### Technology Stack

- Frontend: React, react-router

- Backend: PHP (API-style architecture)

- Database: MySQL

- Server: Apache HTTP Server

- Authentication: JSON Web Tokens (JWT)

## Repository Structure
### Code

    CT4034-Web-Development/
    ├── php/
    │   ├── exceptions/
    │   │   ├── ExpiredTokenException.php
    │   │   └── InvalidSignatureException.php
    │   ├── Auth.php
    │   ├── BikeGateway.php
    │   ├── CaseGateway.php
    │   ├── Config.php
    │   ├── Database.php
    │   ├── ImageGateway.php
    │   ├── Jwt.php
    │   ├── UserGateway.php
    │   ├── Validator.php
    │   └── .htaccess
    │
    ├── public/
    │   ├── api/
    │   │   ├── bikes.php
    │   │   ├── cases.php
    │   │   ├── images.php
    │   │   ├── login.php
    │   │   ├── logout.php
    │   │   ├── refresh.php
    │   │   ├── register.php
    │   │   ├── users.php
    │   │   └── .htaccess
    │   ├── index.html
    │   ├── manifest.json
    │   ├── robots.txt
    │   └── .htaccess
    │
    ├── src/
    │   ├── Account.js
    │   ├── AddBike.js
    │   ├── AdminDashboard.js
    │   ├── Api.js
    │   ├── App.js
    │   ├── Audits.js
    │   ├── AuthApp.js
    │   ├── AuthContext.js
    │   ├── BikeCarousel.js
    │   ├── CaseDetails.js
    │   ├── Cases.js
    │   ├── CaseSearch.js
    │   ├── ControlledRoute.js
    │   ├── DataContext.js
    │   ├── EnrolPolice.js
    │   ├── index.css
    │   ├── index.js
    │   ├── Login.js
    │   ├── Navbar.js
    │   ├── PoliceDashboard.js
    │   ├── PublicDashboard.js
    │   ├── Register.js
    │   └── Roles.js
    │
    ├── .env.example
    ├── .gitignore
    ├── .htaccess
    ├── composer.json
    ├── composer.lock
    ├── deploy.sh
    ├── example.sql
    ├── example-downgraded.sql
    ├── package.json
    ├── package-lock.json
    └── tailwind.config.js

## Running the Project

The backend API can be used directly via curl or consumed by the React frontend.

### Self setup guide:

Tested on Debian

- Install both Apache and Mysql

- Download the latest build, or build it yourself with composer+npm and the deploy.sh script

- Import the MySQL schema from example.sql

- Create the .env (use the example) with database credentials and JWT secrets

- Set the apache DocumentRoot to `.../build/public` 

- Serve the backend and frontend through Apache

- Access the React application through the configured public route

### Academic Context

This project was developed as part of the CT4034 Web Development module for the University of Gloucestershire’s BSc Cybersecurity programme. It demonstrates secure full‑stack development practices, API design, authentication handling, and role-based access control.
