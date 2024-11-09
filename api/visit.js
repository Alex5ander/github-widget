const { Visit, db } = require("../src/models/Visit.js");
const { getWeather } = require("../src/weather.js");
const fetch = require("node-fetch");

/** @param {number} hours */
const getMessage = (hours) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();

  if (day === 13 && month === 8) {
    return "Feliz dia do programador!";
  }

  if (day === 25 && month === 11) {
    return "Feliz natal!";
  }

  if (hours > 17) {
    return "Boa noite";
  } else if (hours > 12) {
    return "Boa tarde";
  } else {
    return "Bom dia";
  }
};

/** @param {number} hours */
const getColor = (hours) => {
  const color = `rgb(0, ${255 - (255 / 23) * hours}, 255)`;
  return color;
};

const insertVisit = async () => {
  await new Promise((resolve, reject) => {
    db.insert(Visit(), (err, doc) => {
      if (err) {
        rejetc(err);
      } else {
        resolve(doc);
      }
    });
  });

  return new Promise((resolve, reject) => {
    db.count({},(err, count) => {
      if (err) {
        reject(err);
      } else {
        resolve(count);
      }
    });
  });
};

/** @param {string} uri */
const pngToBase64 = async (uri) => {
  const request = await fetch(uri.replace("//", "https://"));
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};

/** @type {import('express').RequestHandler} */
module.exports = async (_, res) => {
  const totalVisitis = await insertVisit();
  const data = await getWeather();
  const { current, location } = data;
  const { condition } = current;
  const time = location.localtime.split(" ")[1];
  const hours = parseInt(time.split(":")[0], 10);
  const color = getColor(hours);
  const message = getMessage(hours);

  const iconBase64 = await pngToBase64(condition.icon);

  res.setHeader("content-type", "image/svg+xml");
  res.setHeader(
    "cache-control",
    "max-age=0, no-store, no-cache, must-revalidate"
  );
  res.send(
    `
    <svg version="1.1" style="background-color:${color}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 648 224" width="648px" height="224px">
      <image x="292px" xlink:href="data:image/png;base64,${iconBase64}" />
      
      <text x="50%" y="80px" dominant-baseline="middle" font-size="32px" text-anchor="middle" fill="#fff" >
          ${current.temp_c} º
      </text>

      <text x="50%" y="112px" dominant-baseline="middle" font-size="16px" text-anchor="middle" fill="#fff" >
          ${condition.text}\n
      </text>

      <text x="50%" y="144px" dominant-baseline="middle" font-size="16px" text-anchor="middle" fill="#fff" >
          ${location.name} ${location.region}, ${location.country}.
      </text>

      <text x="50%" y="176px" dominant-baseline="middle" font-size="16px" text-anchor="middle" fill="#fff" >
          Total de visitas: ${totalVisitis} 
      </text>

      <text x="50%" y="208px" dominant-baseline="middle" font-size="16px" text-anchor="middle" fill="#fff" >
          ${message} 
      </text>
  </svg>
    `
  );
};
