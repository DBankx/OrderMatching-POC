import middleWare from '../lib/middleware';
import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getOrder(id){
    let order;

    try{
        const result = await dynamodb.get({
            TableName: process.env.ORDERS_TABLE_NAME,
            Key: {id}
        }).promise();
        order = result.Item;
        console.log(result.Item);
    }catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if(!order){
        throw new createError.NotFound(`Order with ID ${id} was not found`);
    }

    return order;
}

async function getOrderById (event, context) {
    const { id } = event.pathParameters;
    const order = await getOrder(id);
    return {
        statusCode: 200,
        body: JSON.stringify(order)
    };
}


export const handler = middleWare(getOrderById);