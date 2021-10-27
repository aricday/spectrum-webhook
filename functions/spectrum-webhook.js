const fetch = require('node-fetch');
var moment = require('moment-timezone');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.MessagingResponse();
  
  // timezone default to CST
  let timezone = event.timezone || 'America/Chicago';
  const messageTime = moment().tz(timezone).format();
  
  // Initialize the Spectrum Labs API request message body for inspection
  let spectrumReq = { 
          "timestamp": messageTime,
          "category": "sms",
          "content": {
            "id": event.MessageSid,
            "text": event.Body, 
            "attributes": {
              "user-id": event.Author,
              "media-url": event.MediaUrl0,
              "region": event.FromCity + ", " + event.FromState
            }
            }
          };
  const res = await fetch(context.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': context.SPECTRUM_CLIENT_ID,
        'X-Api-Key': context.SPECTRUM_API_KEY
      },
      body: JSON.stringify(spectrumReq),
    });
    
    let data = await res.json();
    let stringData = JSON.stringify(data.behaviors);
    const violationIndex = stringData.indexOf('true');
    console.log(violationIndex);
    console.log(data.behaviors);

    if (violationIndex == -1) {
      callback(null, twiml);
    }
    else {
    //   twiml.message("SMS from ${event.Author} was blocked for content.");
    //   callback(null, twiml);
    let newBody = { "body": "SMS from " + event.Author + " was blocked for content." };
    callback(null, newBody);
    }
}