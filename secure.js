const express = require('express')
const { Client } = require('pg')
const app = express()
var query = ''
var userInput = ''

app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // To handle JSON input

const client = new Client({
    host: 'your-host',
    database: 'your-database',
    username: 'your-username',
    password: 'your-password',
    port: 'your-port',
})
client.connect()

function checkUserInput() {
    query = query.replace('($1)', '"' + userInput + '"')
}

/* 
The returnParameterizedQuery() function returns a paramaterized quert by
cleaning and validating input data by removing or
escaping unsafe, unwanted, or invalid characters. It ensures that the
processed data is safe for use in the intended context (such as storing
in a database, rendering in HTML, or passing to other system components),
reducing the risk of errors, security vulnerabilities, or unexpected
behavior. 
*/
function returnParameterizedQuery() {
    //Paramaterise query

    return 'SELECT * FROM users WHERE name = ($1)'
}

app.post('/search', (req, res) => {
    userInput = req.body.userInput
    query = returnParameterizedQuery()
    checkUserInput()
    client.query(query, [userInput], (err, result) => {
        if (err) throw err
        res.send(result.rows)
    })
})

app.post('/create', (req, res) => {
    const { name } = req.body
    if (!name) {
        res.status(400).send('Name is required')
        return
    }

    const query = 'INSERT INTO users (name) VALUES ($1) RETURNING *;'
    client.query(query, [name], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Internal Server Error')
            return
        }
        res.send(result.rows[0]) // Respond with the created user record
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
