
# AWS Node Scheduled Cron Example
Very simple example of a cron-scheduled AWS lambda that fetches data for a product from a certain online store once a day, parses the data with Cheerio and sends an e-mail (using SNS) to notify the user if the price falls below a certain threshold.

(You will have to give your Lambda permission to post to SNS (SNS:Publish))