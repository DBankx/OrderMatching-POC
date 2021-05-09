import middleWare from '../lib/middleware';
import createOrderSchema from '../lib/schemas/orderSchema';
import validator from '@middy/validator';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';
import currencies from '../lib/helpers/currencies';

const SNS = new AWS.SNS();

async function createOrder(event, context) {
  const { quote_cur, base_cur, quantity, rate, side } = event.body;
  const now = new Date();
  let orderAllowed;

// code to check if the user has enough funds && is ordering currency pairs we deal with
  if(!currencies.includes(quote_cur) || !currencies.includes(base_cur)){
   throw new createError.Forbidden('Sorry, we do not deal with those currencies as of yet');
 }

  if(true){
  orderAllowed = true;
  }

  const order = {
    id: `ORDER_${uuid()}`,
    quote_cur,
    base_cur,
    rate,
    initial_quantity: quantity,
    quantity_remaining: quantity,
    quantity_removed: 0,
    side: side,
    createdAt: now.toISOString(),
    ticker: `${base_cur}#${quote_cur}`,
    orderRate: `${side}#${rate}`
  };

  if(orderAllowed) {
  try {
    await SNS.publish({
      Message: JSON.stringify(order),
      TopicArn: process.env.ORDER_CREATED_TOPIC
    }).promise();
  } catch (error) {
    throw new createError.InternalServerError('An Error occurred while creating your order!, please contact customer services');
  }

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: `Your order was successfully issued at ${order.createdAt}`
      }),
    };
  }

  return {
    statusCode: 403,
    body: JSON.stringify({
      message: 'You are not allowed to place this order'
    })
  };
}


export const handler = middleWare(createOrder).use(validator({inputSchema: createOrderSchema}));

