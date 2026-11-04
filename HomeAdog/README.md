# HomeAdog 🐶
Dog adoption site: HTML + CSS + JS, served by nginx in Docker, with an AI chat guide (Barkley).

## Run
    cp .env.example .env      # add your ANTHROPIC_API_KEY
    docker compose up --build
Open http://localhost:8080

Without a key the bot still replies using simple built-in answers.

## Structure
- index.html: sign up / log in (name, email, password)
- home.html: dog gallery, filters, favourites, adopt, chatbot
- nginx.conf.template: serves files and proxies /api/chat to the Claude API with your key
- Dockerfile, docker-compose.yml

## Notes
Accounts are stored in browser localStorage (passwords SHA-256 hashed) as a demo.
For real users, add a backend with a database and salted password hashing (bcrypt/argon2).
Dog photos come from the free dog.ceo API.
