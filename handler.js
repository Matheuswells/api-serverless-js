import AWS from 'aws-sdk'
import express from 'express'
import serverless from 'serverless-http'

const app = express()

const USERS_TABLE =  process.env.USERS_TABLE

const dynamoDbClient = new AWS.DynamoDB.DocumentClient()


app.use(express.json())


app.get('/users/:userId', async (req, res) => {

    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId
        }
    }
    
    try {
        const { Item } = await dynamoDbClient.get(params).promise()
        if(Item) {
           const { userId, name } = Item
           return  res.json({ userId, name })
        } else {
           return res.status(404).json({ error: 'User not found' })   
        }    
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/users', async (req, res) => {
    const { userId, name, email } = req.body

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId,
            name,
            email
        }
    }

    try {
        
        await dynamoDbClient.put(params).promise()
        return res.json({ userId, name, email })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
})


export const handler = serverless(app)

