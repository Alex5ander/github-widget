const express = require("express");
const mongoose = require('mongoose');
const Visit = require('./models/Visit');
const fetch = require("node-fetch");
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

    Visit.count({}, (error, result) => {
        if (error) {
            return res.status(503).end("error on count");
        }

        res.set({
            'content-type': 'image/svg+xml',
            'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
        });
        res.send(`
            <svg version="1.1" style="background-color:#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 300 160" width="18.75rem" height="10rem">
                <image xlink:href="${condition.icon}" x="7.375rem" style="background-color:red" width="4rem" height="4rem" />    

                <text x="50%" y="5rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" >
                    ${condition.text}\n
                </text>

                <text x="50%" y="7rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" >
                    Faz ${current.temp_c} º em ${location.name} ${location.region}, ${location.country}.
                </text>

                <text x="50%" y="9rem" dominant-baseline="middle" font-size="1rem" text-anchor="middle" >
                    Total de visitas: ${result} 
                </text>
            </svg>
        `);
    });
})