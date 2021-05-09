const schema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                quantity: {
                    type: 'number'
                },
                rate: {
                    type: 'number'
                },
                quote_cur: {
                    type: 'string',
                    enum: ['EUR', 'NGN', 'GBP']
                },
                base_cur: {
                    type: 'string',
                    enum: ['EUR', 'NGN', 'GBP']
                },
                side: {
                    type: 'string',
                    enum: ['BUY', 'SELL']
                }
            },
            required: ['quantity', 'rate', 'quote_cur', 'base_cur', 'side']
        }
    },
    required: ['body']
};

export default schema;