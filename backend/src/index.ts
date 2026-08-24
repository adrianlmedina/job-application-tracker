import express from 'express';
import cors from 'cors';

const app = express();

// runs on every request before it reaches routes
// cors() allows frontend to talk to server
app.use(cors());
app.use(express.json());    // parses incoming JSON request bodies


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// starts the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});





