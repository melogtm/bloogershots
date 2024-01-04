import 'dotenv/config';
import pkg from 'pg'; 

const {Pool} = pkg; 

// Creating Postgres Pool for new connections. 
const dbPool = new Pool({
    user: process.env.DBUSER, 
    host: process.env.DBHOST,
    database:process.env.DBNAME,
    password: process.env.DBPASS,
    port: 54321
});

async function query(stringsql, params) {
    const client = await dbPool.connect(); 
    try {
        return await client.query(stringsql, params); 
    } finally {
        client.release(); 
    }
};

export default query; 