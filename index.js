{/*Back ของ rigistation login*/}
var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt')
const saltRounds = 10
var jwt = require('jsonwebtoken')
const secret = 'Fullstack-login-2023'
require('dotenv').config()


app.use(cors())

const mysql = require('mysql2');
// create the connection to database
const connection = mysql.createConnection(process.env.DATABASE_URL)






{/*databasetable / Search*/}
app.get('/user', function (req, res, next) {
    const page = parseInt(req.query.page);
    const per_page = parseInt(req.query.per_page);
    const sort_column = req.query.sort_column;
    const sort_direction = req.query.sort_direction;
    const search = req.query.search;
    
    const start_idx = (page - 1) * per_page;
    var params = [];
    var sql = 'SELECT * FROM users_intern';
    if(search){
        sql += ' WHERE fullNameEng LIKE ?'
        params.push('%'+search+'%')
    }
    if (sort_column){
        sql += ' ORDER BY '+sort_column+' '+sort_direction;
    }
    sql += ' LIMIT ?, ?'
    params.push(start_idx)
    params.push(per_page)
    console.log(sql,params)
// execute will internally call prepare and query
connection.execute(sql, params,
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server

      // simple query
        connection.query(
            'SELECT COUNT(intern_ID) as total FROM users_intern',
            function(err, counts, fields) {
                const total = counts[0]['total'];
                const total_pages = Math.ceil(total/per_page)
                res.json({
                    page: page,
                    per_page: per_page,
                    total: total,
                    total_pages: total_pages,
                    data: results,
                })
            }
        );
        
      
  
      // If you execute same statement again, it will be picked from a LRU cache
      // which will save query preparation time and give better performance
    }
  );
})
{/*databasetable / Search*/}





{/*เรียกข้อมูลจากฐานข้อมูล*/}
{/*
  app.get('/user', function (req, res, next) {
    const page = parseInt(req.query.page);
    const per_page = parseInt(req.query.per_page);
    const sort_direction = req.query.sort_direction;
    
    const start_idx = (page - 1) * per_page;
// execute will internally call prepare and query
connection.execute(
    'SELECT * FROM `users_intern` LIMIT ?,?',
    [0, 6],
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server
      res.json({results: results})
  
      // If you execute same statement again, it will be picked from a LRU cache
      // which will save query preparation time and give better performance
    }
  );
})
*/}
{/*เรียกข้อมูลจากฐานข้อมูล*/}


























{/*Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation*/}
app.post('/register', jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        connection.execute(
            'INSERT INTO users (email,password,fname,lname) VALUES (?,?,?,?)',
            [req.body.email,hash,req.body.fname,req.body.lname],
            function(err, results, fields) {
                if(err) {
                    res.json({status: 'error', message:err})
                    return
                }
              res.json({status:'ok'})
            }
          );
    });

})


app.post('/login', jsonParser, function (req, res, next) {
    connection.execute(
        'SELECT * FROM users WHERE email=?',
        [req.body.email],
        function(err, users, fields) {
            if(err) {
                res.json({status: 'error', message:err})
                return
            }
            if (users.length == 0) {
                res.json({status: 'error', message:'no user found'})
                return
            }
            bcrypt.compare(req.body.password,users[0].password,function(err,isLogin) {
                if(isLogin){
                    var token = jwt.sign({ email: users[0].email }, secret,{ expiresIn: '1h' });
                    res.json({status: 'ok', message:'login sccess',token, email: users[0].email})// เพิ่ม email ในการส่งคืนข้อมูล
                }else {
                    res.json({status: 'error', message:'login failed'})
                }
            }); 
        }
      );
})



app.post('/authen', jsonParser, function (req, res, next) {
try {
    const token =req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret);
    res.json({status: 'ok' ,decoded })
}catch (err) {
    res.json({status: 'error' ,message: err.message })
}
  
})
{/*Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation Login / Registation*/}






{/*ทดสอบ*/}
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM users_intern';
  connection.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});


app.get('/data/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM users_intern WHERE intern_ID = ?';
  connection.query(query, id, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});


app.get('/search', function (req, res, next) {
  const search = req.query.search;

  const sql = 'SELECT * FROM users_intern WHERE fullNameEng LIKE ?';
  const params = ['%' + search + '%'];

  connection.execute(sql, params, function (err, results, fields) {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(results);
  });
});




app.listen(3333, function () {
  console.log('CORS-enabled web server listening on port 3333')
})
//connection.end()








