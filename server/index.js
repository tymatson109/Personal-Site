import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Set up the server
const app = express();
// app.use(bodyParser.json());
app.use(cors())
app.use(express.static('static'))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'static/index.html'))
})
  
// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});