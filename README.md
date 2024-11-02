# Notespacehub
### _Your daily tracker notes, todos and habits manager_

![Notespacehub](https://ik.imagekit.io/p4ukigs1hrvx/notespacehub-bg_iu22nzgdf.png?updatedAt=1730190310235)

> **Live**: [https://notehub-pi.vercel.app](https://notehub-pi.vercel.app/)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Built With](#built-with)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Contributes](#contributes)
- [Contact](#contact)

---

## About the Project 

Welcome to **NotespaceHub**! This app is your all-in-one productivity tool designed to simplify note-taking, task management, and habit tracking. Built for collaboration and personal productivity, NotespaceHub aims to keep you organized and motivated to accomplish more.

![Project Screenshot](https://ik.imagekit.io/p4ukigs1hrvx/notespacehub-ss-1.png?updatedAt=1730545016690)

### Built With
- [NextJS](https://nextjs.org)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [NestJS](https://nestjs.com/)
- [PostgresSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)

## Features
- **My Space 💻**, on this page you can manage your notes, todos, folder and any.
- **Collaborate**, you can working on other people project in this page as long as they account you as collaborator either as Editor or Viewer 😘
- **Write 📝**, there is 3 type of notes so far you can create namely Freetext, Todo and Habits.
- **Habits**, make your goals from small habits. you can use this feature to track your day, week and monthly task of habits you want to build 🚀
- other cool feature is coming soon 🔥🔥🔥

## Getting Started

### Prerequisites
To get the project up and running, you'll need to install the following:
- Frontend
    - Node > v18.18.2
    - Google Oauth id and secret key
    - Github Oauth id and secret key
    - Unsplash App name, **optional**
- Backend
    - Node > v18.18.2
    - PostgreSQL
    - AWS Account ( S3 for uploading file mechanism )
    - Email provider ( ex: Gmail, Mailtrap, Mailchimp ), **optional**
    - Unsplash access key, **optional**

### Installation
#### Frontend
- Clone the repo
   ```base
   https://github.com/fiqriardiansyah/notehub.git
   ```
- Install
   ```
   npm install
   npm install --force //if command above showing error
   ```
- Create .env file, copy inside .env.example and fill with your config
- Running
    - Development
        ```
        npm run dev
        ```
    - Production
        ```
        npm run build
        npm run start
        ```
#### Backend
- Clone the repo
    ```
    https://github.com/fiqriardiansyah/notehub-api.git
    ```
- Install
   ```
   npm install
   ```
- Create .env file, copy inside .env.example and fill with your config
- Running
    - Prerequisites
        - create 'notehub' (make sure db name align with .env DATABASE URL) database in postgresql
        - running prisma command
            ```
            npx prisma migrate dev
            npx prisma generate
            ```
    - Development
        ```
        npm run start:dev
        ```
    - Production
        ```
        npm run build
        npm run start
        ```
## Contributes
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

- Fork the Project
- Create your Feature Branch (git checkout -b feature/YourFeature)
- Commit your Changes (git commit -m 'feat: Add some feature')
- Push to the Branch (git push origin feature/YourFeature)
- Open a Pull Request

## Contact
**Project initiator**: Fiqri Ardiansyah - [fiqriardian92@gmail.com]

GAASSS 🚀🔥🔥