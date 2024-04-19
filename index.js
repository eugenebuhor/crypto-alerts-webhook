require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.json());

const PHONE_NUMBERS = process.env.PHONE_NUMBERS.split(',');
const FROM_PHONE_NUMBER = process.env.FROM_PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const PORT = process.env.PORT || 3000;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.get('/', (req, res) => res.send('OK'));

app.get('/twiml.xml', (req, res) => {
  res.type('text/xml');
  res.send(`
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="alice">Testing message.</Say>
        </Response>
    `);
});

app.get('/trigger-calls', (req, res) => {
  const twimlUrl = `${req.protocol}://${req.get('host')}/twiml.xml`;

  const promises = PHONE_NUMBERS.map(number => {
    return client.calls.create({
      to: number,
      from: FROM_PHONE_NUMBER,
      url: twimlUrl
    });
  });

  Promise.all(promises)
    .then(results => {
      const message = results.map(call => `Call initiated with SID: ${call.sid}`).join(', ');
      res.send(message);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Failed to initiate calls");
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
