import middleWare from '../lib/middleware';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function processOrderByInitialEntry(event, context){
    const order = JSON.parse(event.Records[0].Sns.Message);
    const { quote_cur, base_cur, side, rate } = order;
    const params = {
        TableName: process.env.ORDERS_TABLE_NAME,
        IndexName: 'ticker_orderRate',
        KeyConditionExpression: `ticker = :ticker and orderRate between :baseRate and :maxRate`,
        ExpressionAttributeValues: {
            ':ticker': `${base_cur}#${quote_cur}`,
            ':maxRate': `${side === 'BUY' ? 'SELL' : 'BUY'}#${rate}`,
            ':baseRate': `${side === 'BUY' ? 'SELL' : 'BUY'}#0.00`,
        }
    };

    // Number of items returned that meet the search criteria
    let possibleTrades;

    // People who completed the trade
    const makers = [];

    try{
        const result = await dynamodb.query(params).promise();
        possibleTrades = result.Items;
    }catch(error){
        throw error;
    }

    // Run trade matching algorithm
for(let i=0; i<possibleTrades.length; i++){
            const maker = possibleTrades[i];
            const quantityToRemove = Math.min(order.quantityRemaining, maker.quantity);
            order.quantityRemaining -= quantityToRemove;
            maker.quantityRemoved += quantityToRemove;
            maker.quantityRemaining -= quantityToRemove;
            order.quantityRemoved += quantityToRemove;
            makers.push(maker);
            if(order.quantityRemaining <= 0) break;
        }

        // final result of the trade that occurred
        const trades = {
            taker: order,
            makers,
            takeValue: makers.reduce((acc, current) => acc + current.quantityRemoved, 0)
        };

        console.log(trades);
};

export const handler = middleWare(processOrderByInitialEntry);