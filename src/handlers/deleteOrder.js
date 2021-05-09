import middleWare from '../lib/middleware';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import { getOrder } from './getOrderById';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteOrder(event, context) {

    const { id } = event.pathParameter;

    const order = await getOrder(id);

    if(!order) throw new createError.NotFound(`Order with ID ${id} was not found`);

  try {
    await dynamodb.delete({
      TableName: process.env.ORDERS_TABLE_NAME,
      Key: {id}
    }).promise();
  } catch (error) {
    throw new createError.InternalServerError('An Error occurred while deleting your order, please contact customer services');
  }

  return {
    statusCode: 204,
    body: JSON.stringify({
        message: 'Your order was successfully deleted'
    }),
  };
}


export const handler = middleWare(deleteOrder);