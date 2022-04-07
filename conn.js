const mysql = require('mysql')

const conn = mysql.createConnection({
    name: 'user_db',
    user: 'root',
    password: '',
    database: 'user_db'
})

conn.connect(err => {
    if(err){
        throw err
    }else{
        console.log('Connected to database successfully')
    }
})

module.exports = conn