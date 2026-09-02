# Second Brain 

This is a full-stack CRUD application that keeps track of what jobs the user has been applying to. It logs companies, roles, and statuses.



# DEMO

In progress


# Architecture Explanation

1. User registers - user's password is hashed with bcrypt before storage
2. User logs in - credentials are verified, then short lived and long lived tokens are issued
3. Frontend stores both tokens and attaches access token to every protected request
4. Express middleware verifies the JWT signature on every protected route before allowing the request through
5. When access token expires, the refresh token is exchanged for a new one, and old one is thrown away


# Tech Stack
## Backend
+ <u>Node.js + Express + TypseScript</u> - REST API server
+ <u>PostgreSQL</u> - relational database
+ <u>PrismaORM</u> - type-safe database queries and schema migrations
+ <u>JWT + bcrypt</u> - authentication, built from scratch
+ <u>Zod</u> - request validation on every endpoint 
+ <u>Docker</u> - containerized local Postgres instance


## Frontend
+ <u>React + TypeScript</u> - UI
+ <u>Tailwind CSS </u> - styling

# Database Schema
+ <u>User</u> - account info, hashed password, role
+ <u>RefreshToken</u> - hashed refresh tokens with expiration date and revokation tracking, enabling rotation
+ <u>Application</u> - company, role, status 

