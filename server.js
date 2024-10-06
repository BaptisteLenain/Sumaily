console.log('Starting server script');

require('dotenv').config();

try {
    const express = require('express');
    const path = require('path');

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.static(path.join(__dirname, '.')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/env.js', (req, res) => {
        res.set('Content-Type', 'application/javascript');
        res.send(`window.ENV = ${JSON.stringify({
            OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
            NEWS_API_KEY: process.env.NEWS_API_KEY
        })};`);
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('OpenWeatherMap API Key:', process.env.OPENWEATHERMAP_API_KEY);
        console.log('News API Key:', process.env.NEWS_API_KEY);
    }).on('error', (err) => {
        console.error('Error starting server:', err);
    });
    
    
} catch (error) {
    console.error('Caught an error:', error);
}



console.log('Server script executed');
