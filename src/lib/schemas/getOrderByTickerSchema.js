const schema = {
    type: 'object',
    properties: {
        queryStringParameters: {
            type: 'object',
            properties: {
                product: {
                    type: 'string'
                }
            },
            required: [
                'product'
            ]
        }
    },
    required: [
        'queryStringParameters'
    ]
};

export default schema;