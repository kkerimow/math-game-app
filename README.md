# Multiplayer Math Game

A real-time multiplayer math game where players compete to solve math problems.

## Features

- User registration and authentication
- Real-time multiplayer gameplay
- Four different operations (+, -, *, /)
- Score tracking
- Timer-based rounds
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Real-time: Socket.IO

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd math-game
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Heroku Deployment

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

3. Deploy to Heroku:
```bash
git push heroku main
```

### Manual Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set environment variables on your server
3. Start the server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 