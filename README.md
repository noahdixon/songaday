# Songaday

#### A full stack web application that generates daily song recommendations using the Spotify API. Check out the hosted app [here](https://songaday-c55568279e83.herokuapp.com).

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Technologies](#technologies)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#backend)
  - [Deployment](#backend)
- [Takeaways](#takeaways)

## Overview
Songaday utilizes Spotify's Web API to generate song recommendations for users based on content they like. Through the app, users can search Spotify for songs, albums, and artists, and add these pieces of content to their own personal pool of "Liked Content". Songaday uses this content pool to generate personalized song recommendations, and users can specify how often they receive recommendations with frequencies ranging from once per day to once per month. On days when users are scheduled to receive a new recommendation, Songaday will generate and deliver a recommendation for them at 12 PM EST. Users can opt in to receiving email notifications for new recommendations, or choose not to receive emails and simply check the "Recommendations" page on the app. Instructions for registering with Songaday and getting started are outlined below.

## Getting Started
1. Navigate to the [Songaday Register Page](https://songaday-c55568279e83.herokuapp.com/auth/register), and make an account with your email.

2. After successfully registering you will be redirected to the [Login Page](https://songaday-c55568279e83.herokuapp.com/auth/login). Log in with your new account.

3. After Logging in, you will be taken to your Recommendations Page, which will be empty. In order to start receiving song recommendations, navigate to the [Search Page](https://songaday-c55568279e83.herokuapp.com/search/songs) and search for songs, albums, and artists that you like. You can like a song, album, or artist by right clicking on it and selecting "Like".

4. You can browse the content that you've liked on the [Liked Content Page](https://songaday-c55568279e83.herokuapp.com/content/songs). Here you can remove a piece of content from your content pool by right clicking on it and selecting "Remove".

5. On the [Delivery Settings Page](https://songaday-c55568279e83.herokuapp.com/settings), you can opt in or out of receiving email notifications for new song recommendations, and also change the recommendation frequency.

6. In order to logout, you can click the profile symbol at the top right of the screen, and select "Logout".

## Technologies

### Frontend
The Songaday frontend is built using React, Typescript, HTML, and CSS. React Router is used for a structured and navigable UI, React Components employ a modular design, and React Context efficiently manages global state such as user authentication and user content. The frontend is bundled and served as static files by the backend using Express, which delivers the pre-built React app from the build directory.

### Backend
The backend is written in Typescript and built using Node.js and Express. It employs a JSON Web Token (JWT) based authentication mechanism, provides REST API endpoints with authorization middleware for user CRUD operations, manages interaction with the Spotify API using an exponential backoff strategy, and serves the pre-built React app frontend from the build directory. It also contains a script which is configured to run once daily via the Heroku Scheduler that generates song recommendations and delivers email notifications to users.

### Database
A Heroku PostgreSQL database is used for data persistence. It temporarily stores user refresh tokens, recommendations, content, and Spotify API access tokens.

### Deployment
Songaday is deployed via Heroku, which manages both the frontend and backend environments. The backend runs as a Node.js server, while the React frontend is served as static files. Environment variables such as API and database credentials are securely managed through Heroku's configuration system. The app also utilizes Heroku Scheduler to run daily background tasks, such as generating song recommendations and sending email notifications to users.
   
## Takeaways
This project is my first complete and hosted full stack web application, and many of the technologies and methodologies I used were new to me when I started. It served as an excellent catalyst to get familiar with several design techniques and technologies, namely TypeScript, React, Node.js, JWT authentication, REST API design, interaction with external APIs, database configuration, and deployment via Heroku. I feel this experience has significantly expanded my skill set as a software engineer and has given me the confidence to tackle more complex full stack projects in the future.