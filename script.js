//require('dotenv').config(); // Load environment variables from .env file

document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    loadSavedData();

    // Add event listeners for buttons
    document.getElementById('new-fact-btn').addEventListener('click', fetchRandomFact);
    document.getElementById('new-history-btn').addEventListener('click', fetchHistoricalFacts);
    document.getElementById('new-books-btn').addEventListener('click', updateBooks);
    document.getElementById('new-articles-btn').addEventListener('click', updateArticles);
    document.getElementById('new-quotes-btn').addEventListener('click', updateQuotes);
});

function updateDate() {
    const dateElement = document.getElementById('date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString(undefined, options);
}

async function fetchWeather() {
    console.log('Fetching weather data...');
    if (!process.ENV || !process.ENV.OPENWEATHERMAP_API_KEY) {
        console.error('API key not found. Make sure env.js is loaded and contains the key.');
        document.querySelector('#weather .content').textContent = 'Weather data unavailable';
        return;
    }
    const apiKey = process.ENV.OPENWEATHERMAP_API_KEY;
    console.log('API Key:', apiKey); // This will log your API key, be careful not to share this log
    const city = 'Berlin'; // Replace with your desired city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    console.log('Fetching from URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Weather data received:', data);
        
        if (response.ok) {
            displayWeather(data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.querySelector('#weather .content').textContent = 'Failed to load weather data';
    }
}

function displayWeather(data) {
    const weatherContent = document.querySelector('#weather .content');
    if (!data || !data.main || !data.weather || data.weather.length === 0) {
        weatherContent.textContent = 'Invalid weather data received';
        console.error('Invalid weather data:', data);
        return;
    }

    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const cityName = data.name;
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const highTemp = Math.round(data.main.temp_max);
    const lowTemp = Math.round(data.main.temp_min);
    
    weatherContent.innerHTML = `
        <div class="weather-info">
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="weather-details">
                <h3>${cityName}</h3>
                <p>${temperature}°C, ${description}</p>
                <p>H: ${highTemp}°C L: ${lowTemp}°C</p>
            </div>
        </div>
    `;
}

async function fetchHistoricalFacts() {
    const url = 'https://history.muffinlabs.com/date';

    try {
        const response = await fetch(url);
        const data = await response.json();
        saveToLocalStorage('historicalFacts', data);
        displayHistoricalFacts(data);
    } catch (error) {
        console.error('Error fetching historical facts:', error);
        document.querySelector('#facts .content').textContent = 'Failed to load historical facts';
    }
}

function displayHistoricalFacts(data) {
    const factsContent = document.querySelector('#facts .content');
    const events = data.data.Events;
    const randomEvents = getRandomItems(events, 3);

    let factsHTML = '<ul>';
    randomEvents.forEach(event => {
        factsHTML += `<li><strong>${event.year}</strong>: ${event.text}</li>`;
    });
    factsHTML += '</ul>';

    factsContent.innerHTML = factsHTML;
    saveToLocalStorage('displayedHistoricalFacts', randomEvents);
}

function getRandomItems(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function fetchRandomFact() {
    const url = 'https://uselessfacts.jsph.pl/random.json?language=en';

    try {
        const response = await fetch(url);
        const data = await response.json();
        saveToLocalStorage('randomFact', data);
        displayRandomFact(data);
    } catch (error) {
        console.error('Error fetching random fact:', error);
        document.querySelector('#random-facts .content').textContent = 'Failed to load random fact';
    }
}

function displayRandomFact(data) {
    const factContent = document.querySelector('#random-facts .content');
    factContent.innerHTML = `<p>${data.text}</p>`;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : null; // Safely parse the data
    } catch (error) {
        console.error(`Error parsing data from localStorage for key "${key}":`, error);
        return null; // Return null if parsing fails
    }
}

function loadSavedData() {
    const savedHistoricalFacts = getFromLocalStorage('historicalFacts');
    const savedRandomFact = getFromLocalStorage('randomFact');
    const savedBooks = getFromLocalStorage('books');
    const savedQuotes = getFromLocalStorage('quotes');

    if (savedHistoricalFacts) {
        displayHistoricalFacts(savedHistoricalFacts);
    } else {
        fetchHistoricalFacts();
    }

    if (savedRandomFact) {
        displayRandomFact(savedRandomFact);
    } else {
        fetchRandomFact();
    }

    if (savedBooks) {
        displayBooks(savedBooks);
    } else {
        updateBooks();
    }

    if (savedQuotes) {
        displayQuotes(savedQuotes);
    } else {
        updateQuotes(); // Fetch new quotes if none are saved
    }

    fetchArticles().then(displayArticles);  // Load articles on page load

    fetchWeather();
}

async function fetchBooks(forceUpdate = false) {
    const savedDate = localStorage.getItem('booksDate');
    const today = new Date().toDateString();
    
    if (!forceUpdate && savedDate === today && localStorage.getItem('books')) {
        return JSON.parse(localStorage.getItem('books'));
    }

    const subjects = ['fiction', 'science', 'history', 'philosophy', 'biography','business','technology'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${randomSubject}&maxResults=40&langRestrict=en`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const books = getRandomItems(data.items, 3);
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('booksDate', today);
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

function displayBooks(books) {
    const booksContent = document.querySelector('#book-recommendations .content');
    if (books.length === 0) {
        booksContent.innerHTML = 'Failed to load book recommendations';
        return;
    }

    let html = '<ul>';
    books.forEach((book, index) => {
        const volumeInfo = book.volumeInfo;
        const title = volumeInfo.title;
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
        const description = volumeInfo.description || 'No description available';
        const link = volumeInfo.infoLink;

        html += `
            <li>
                <h3><a href="${link}" target="_blank">${title}</a></h3>
                <p><strong>By:</strong> ${authors}</p>
                <p class="description">
                    ${description.substring(0, 200)}
                    <span class="more">${description.substring(200)}</span>
                    ${description.length > 200 ? 
                        `<button class="read-more" onclick="toggleDescription(${index})">Read More</button>` : 
                        ''}
                </p>
            </li>
        `;
    });
    html += '</ul>';

    booksContent.innerHTML = html;
}

// Add this function to toggle the description
function toggleDescription(index) {
    const description = document.querySelectorAll('#book-recommendations .description')[index];
    const moreText = description.querySelector('.more');
    const btnText = description.querySelector('.read-more');

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.textContent = "Read Less";
    } else {
        moreText.style.display = "none";
        btnText.textContent = "Read More";
    }
}

// Make sure to expose toggleDescription to the global scope
window.toggleDescription = toggleDescription;

async function updateBooks() {
    const books = await fetchBooks(true);  // Force a new fetch
    displayBooks(books);
}

async function fetchArticles(forceUpdate = false) {
    const newsApiKey = process.ENV.NEWS_API_KEY; // Fetch the API key from environment variables
    console.log('API Key:', newsApiKey); // Log the API key to check if it's set correctly
    const savedDate = localStorage.getItem('articlesDate');
    const today = new Date().toDateString();
    
    if (!forceUpdate && savedDate === today && localStorage.getItem('articles')) {
        return JSON.parse(localStorage.getItem('articles'));
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const articles = getRandomItems(data.articles, 5);
        localStorage.setItem('articles', JSON.stringify(articles));
        localStorage.setItem('articlesDate', today);
        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

function displayArticles(articles) {
    const articlesContent = document.querySelector('#article-recommendations .content');
    if (articles.length === 0) {
        articlesContent.innerHTML = 'Failed to load article recommendations';
        return;
    }

    let html = '<ul>';
    articles.forEach(article => {
        const title = article.title;
        const description = article.description || 'No description available';
        const url = article.url;

        html += `
            <li>
                <h3><a href="${url}" target="_blank">${title}</a></h3>
                <p>${description}</p>
            </li>
        `;
    });
    html += '</ul>';

    articlesContent.innerHTML = html;
}

async function updateArticles() {
    const articles = await fetchArticles(true);  // Force a new fetch
    displayArticles(articles);
}

async function fetchQuotes(forceUpdate = false) {
    const savedDate = localStorage.getItem('quotesDate');
    const today = new Date().toDateString();
    
    if (!forceUpdate && savedDate === today && localStorage.getItem('quotes')) {
        return JSON.parse(localStorage.getItem('quotes'));
    }

    const url = `https://api.quotable.io/quotes/random?limit=3`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Fetched quotes data:', data); // Log the fetched data
        console.log(data.length);
        // Check if the response has results
        if (!data || data.length === 0) {
            console.error('No quotes found in the response.');
            return []; // Return an empty array if no quotes are found
        }

        const quotes = data; // Use the results directly
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('quotesDate', today);
        return quotes;
        console.log('Quotes:', quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error); // Log the error
        return [];
    }
}

function displayQuotes(quotes) {
    const quotesContent = document.querySelector('#quotes .content');
    if (!quotes || quotes.length === 0) { // Check if quotes is defined and has length
        quotesContent.innerHTML = 'Failed to load quotes';
        return;
    }

    let html = '<ul>';
    quotes.forEach((quote) => { // Use quotes instead of books
        const content = quote.content;
        const author = quote.author;

        html += `
            <li>
                <h3>${content}</h3>
                <p>${author}</p>
            </li>
        `;
    });
    html += '</ul>';

    quotesContent.innerHTML = html;
}

async function updateQuotes() {
    console.log('Updating quotes...'); // Log to confirm this function is called
    const quotes = await fetchQuotes(true);  // Force a new fetch
    displayQuotes(quotes);
}