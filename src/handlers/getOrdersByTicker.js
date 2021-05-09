import middleWare from '../lib/middleware';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import schema from '../lib/schemas/getOrderByTickerSchema';
import validator from '@middy/validator';
import currencies from '../lib/helpers/currencies';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getOrdersByTicker(event, context){
    let orders;

    const { product } = event.queryStringParameters;

    const ticker = product.split('_');

    if(!currencies.includes(ticker[0]) || !currencies.includes(ticker[1])){
        throw new createError.BadRequest('Sorry we do not deal with this currency as of yet');
    }

    const params = {
        TableName: process.env.ORDERS_TABLE_NAME,
        IndexName: 'tickerAndStatusTime',
        KeyConditionExpression: 'ticker = :ticker and (begins_with(orderRate, BUY) or begins_with(orderRate, SELL))',
        ExpressionAttributeValues:{
            ':ticker': `${ticker[0]}#${ticker[1]}`
        }
    };

    try {
       const result = await dynamodb.query(params).promise();
       orders = result.Items;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(orders)
    };
};

export const handler = middleWare(getOrdersByTicker).use(validator({inputSchema: schema}));