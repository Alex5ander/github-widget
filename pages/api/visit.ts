// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import Visit from '../../models/Visit';
import { WeatherResponse, getWeather } from './weather';
let cluster: MongoClient = global.mongoose;

const getMessage = (hours: number) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();

  if (day === 13 && month === 8) {
    return 'Feliz dia do programador!';
  }

  if (day === 25 && month === 11) {
    return 'Feliz natal!';
  }

  if (hours > 17) {
    return 'Boa noite';
  } else if (hours > 12) {
    return 'Boa tarde';
  } else {
    return 'Bom dia';
  }
};

const getColor = (hours: number) => {
  const color = `rgb(0, ${255 - (255 / 23) * hours}, 255)`;
  return color;
};

const connectToDataBase = async () => {
  try {
    return MongoClient.connect(process.env.DATABASEURI!);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const insertVisit = async () => {
  if (!cluster) {
    cluster = await connectToDataBase();
  }

  if (cluster) {
    const db = cluster.db('widget');

    const collection = db.collection('visits');

    await collection.insertOne(Visit());

    const visits = await collection.countDocuments();

    return visits;
  }

  return 0;
};

const pngToBase64 = async (uri: string) => {
  const request = await fetch(uri.replace('//', 'https://'));
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.url === '/favicon.ico') {
    res.status(204).end();
    return;
  }
  const totalVisitis = await insertVisit();
  const data: WeatherResponse = await getWeather();
  const { current, location } = data;
  const { condition } = current;
  const time = location.localtime.split(' ')[1];
  const hours = parseInt(time.split(':')[0], 10);
  const color = getColor(hours);
  const message = getMessage(hours);

  const iconBase64 = await pngToBase64(condition.icon);

  res.setHeader('content-type', 'image/svg+xml');
  res.setHeader(
    'cache-control',
    'max-age=0, no-store, no-cache, must-revalidate'
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
}
