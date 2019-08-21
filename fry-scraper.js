const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const constants = require('./food-constants');

axios.get(constants.url)
    .then(res => {
        if (res.status !== 200)
            return 'err fetching url';
        const data = [];
        const html = res.data;
        const $ = cheerio.load(html);
        const body = $('.asset #asset-content p');
        // skip first 2 and last 2 p tags as they are not locations
        for (let i = 3; i < body.length; i++) {
            const text = $(`.asset #asset-content p:nth-of-type(${i})`).text().toString();
            const obj = {
                title: text.match('^[^:]*') ? text.match('^[^:]*')[0] : null,
                street: text.match(/\d{1,3}.?\d{0,3}\s[a-zA-Z]{2,30}\s[a-zA-Z]{2,15}/) ? text.match(/\d{1,3}.?\d{0,3}\s[a-zA-Z]{2,30}\s[a-zA-Z]{2,15}/)[0] : null,
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
        let json = {data: data};
        json = JSON.stringify(json);
        fs.writeFile('fish-fry.json', json, 'utf8', (err) => {
            return err;
        });
        console.log('*** fish fries scraped 🤘 ***');
    }, err => console.log(err));
