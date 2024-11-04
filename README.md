# Team6

# BuddyBudget

BuddyBudget is an application designed to help users manage their finances. The project includes a frontend built with React and a backend using Django, both configured to run in Docker containers.

## Prerequisites

- Have Docker and Docker Compose installed.
- Clone this repository onto your local machine.

## Installation and Execution

1. Clone the repository and navigate to the project’s root directory:

   git clone https://github.com/WendySC25/BuddyBudget.git
   cd BuddyBudget

2. Build and run the application using Docker Compose. Ensure you’re in the same directory as `docker-compose.yml`:

   docker-compose up --build

3. Once the containers are running, access the frontend of the application in your browser:

   http://localhost:80

## Shutting Down the Project

To stop the containers and free up resources, use:

    docker-compose down


## Project Structure

- **Frontend**: Built with React, it provides the user interface. Additional instructions and development scripts are in the frontend folder’s `README.md`.

  To run the frontend in development mode outside of Docker:

  cd frontend
  npm install
  npm start

  This will open the application at `http://localhost:3000`.

- **Backend**: Built with Django and Django REST Framework, it provides the API that serves the frontend. 

## Resources and Documentation

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Django Documentation](https://docs.djangoproject.com/en/stable/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

