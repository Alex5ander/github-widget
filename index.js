const express = require("express");
const mongoose = require('mongoose');
const Visit = require('./models/Visit');
const fetch = require("node-fetch");
const imageToBase64 = require('image-to-base64');
const backgroundColors = ["#bee4e7", "#9ddbf0", "#d3bedd", "#f4cfe1", "#f8c9d3", "#fbf6bc"];

require("dotenv").config();

const current_forecast_uri = `http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=${encodeURI('Itapeva, São Paulo')}&aqi=no&lang=pt`;

const getCurrentForecast = async () => {
    let data = null;
    let error = null;
    try {
        const request = await fetch(current_forecast_uri);
        const json = await request.json();
        data = json;
    } catch (errors) {
        error = errors;
    }

    return { error, data };
}

const app = express();

app.listen(3000, () => {
    console.log("Server started");
});

app.get('/', async (req, res) => {

    mongoose.connect(process.env.DATABASEURI, (error) => {
        if (error) {
            return res.status(503).end("database connection error");
        }
    });

    const visit = new Visit();
    visit.save(error => {
        if (error) {
            return res.status(503).end("error on save");
        }
    })

    const { data, error } = await getCurrentForecast();

    if (error) {
        return res.status(503).end();
    }

    const { current, location } = data;
    const condition = current.condition;
    const b64 = await imageToBase64('https:' + current.condition.icon);

    Visit.count({}, (error, result) => {
        if (error) {
            return res.status(503).end("error on count");
        }

        res.set({
            'content-type': 'image/svg+xml',
            'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
        });
        const color = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
        res.send(`
            <svg version="1.1" style="background-color:${color}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 300 192" width="18.75rem" height="12rem">
                <image x="7.375rem" xlink:href="data:image/png;base64,${b64}" />
                <text x="50%" y="5rem" dominant-baseline="middle" font-size="2rem" text-anchor="middle" fill="#fff" >
                    ${current.temp_c} º
                </text>

                <text x="50%" y="7rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" fill="#fff" >
                    ${condition.text}\n
                </text>

                <text x="50%" y="9rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" fill="#fff" >
                    ${location.name} ${location.region}, ${location.country}.
                </text>

                <text x="50%" y="11rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" fill="#fff" >
                    Total de visitas: ${result} 
                </text>
            </svg>
        `);
    });
})