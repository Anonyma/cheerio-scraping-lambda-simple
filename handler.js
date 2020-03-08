const cheerio = require('cheerio'),
  axios = require('axios'),
  AWS = require('aws-sdk'),
  // TODO: Allow multiple comma-separated URLs
  url = process.env.URL,
  desiredPrice = process.env.DESIRED_PRICE;

const sns = new AWS.SNS({
  region: "eu-west-1",
});


module.exports.run = (event, context) => {
  axios.get(url,
    {
      // Avoid getting "Access denied" :)
      headers: { "User-Agent": 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36' }
    })
    .then((response) => {
      const { targetPrice, mainName, subtitle } = getDesiredData(response.data);

      console.log(`The following product's (${mainName} - ${subtitle}) price is now lower than ${desiredPrice}: ${url}`);
      if (targetPrice < desiredPrice) {
        publishToSNS(`The following product's (${mainName} - ${subtitle}) price is now lower than ${desiredPrice}: ${url}`)
      }
    }).catch(function (e) {
      console.log(e);
    });
};


function getDesiredData(body) {
  let $ = cheerio.load(body);
  let targetPrice = parseFloat($('.price-value').text().replace('€', '')).toFixed(2);
  let mainName = $('.primary product-item-headline').text();
  let subtitle = $('.product-input-label').text();

  return { targetPrice, mainName, subtitle }
}

async function publishToSNS(message) {
  let messageData = {
    Message: message,
    TopicArn: process.env.SNS_TOPIC_ARN,
  };

  // Find these logs @ Cloudwatch
  console.log("PUBLISHING MESSAGE TO SNS:", messageData);

  try {
    await sns.publish(messageData).promise();
    console.log("PUBLISHED MESSAGE TO SNS:", messageData);
  }
  catch (err) {
    console.log(err);
  }
}