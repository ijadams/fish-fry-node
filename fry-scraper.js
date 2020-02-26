const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const constants = require('./food-constants');
const NodeGeocoder = require('node-geocoder');

const googleApi = require('./credentials');

const options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: googleApi, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);

let globalState = null;

axios.get(constants.url)
    .then(res => {
        if (res.status !== 200)
            return 'err fetching url';
        let data = [];
        const html = res.data;
        const $ = cheerio.load(html);
        const section = $('body section');
        // skip first 2 and last 2 p tags as they are not locations
        for (let i = 0; i < section.length; i++) {
            const text = $(`body section:nth-of-type(${i})`).text().toString();
            const obj = {
                title: text.match('^[^:]*') ? text.match('^[^:]*')[0] : null,
                street: text.match(/\d{1,3}.?\d{0,3}\s?.[a-zA-Z]{2,30}?.\s[a-zA-Z]{2,15}/) ? text.match(/\d{1,3}.?\d{0,3}\s?.[a-zA-Z]{2,30}?.\s[a-zA-Z]{2,15}/)[0] : null,
                startTime: text.match(/\d{1,2}(\.\d{1,2})? ?([a|p].m.|noon)/) ? text.match(/\d{1,2}(\.\d{1,2})? ?([a|p].m.|noon)/)[0] : null,
                endTime: text.match(/\d{1,2}(\.\d{1,2})? ?([a|p].m.,|noon,)/) ? text.match(/\d{1,2}(\.\d{1,2})? ?([a|p].m.,|noon,)/)[0] : null,
                everyFriday: text.toLowerCase().match('every friday') ? text.toLowerCase().match('every friday').length > 0 : false,
                dates: text.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})[^.]+[.]/g),
                telephone: text.match(/(?:(?:\+?([1-9]|[0-9][0-9]|[0-9][0-9][0-9])\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([0-9][1-9]|[0-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g),
                email: text.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
                food: constants.getFood(text, constants.foodLexicon)
            };
            data.push(obj);
        }
        globalState = data;
        return Promise.resolve(data);
    }).then(res => {
        return Promise.all(res.map(location => {
            return geocoder.geocode(`${location.street} new orleans la`)
                .then(res => {
                    return res;
                }, err => {
                    console.log('err', err);
                });
        }));
    }).then(res => {
        globalState.forEach((l, i) => {
            l.geo = res[i];
        });
        let json = {data: globalState};
        json = JSON.stringify(json);
        fs.writeFile('fish-fry.json', json, 'utf8', (err) => {
            return err;
        });
        console.log('*** fish fries scraped 🤘 ***');
        return Promise.resolve();
    }, err => {
        console.log('err', err);
    });
