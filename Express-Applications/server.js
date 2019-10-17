var express = require('express');
var app = express();
var cors = require('cors');
var fs = require('fs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var busboy = require('connect-busboy');
const AWS = require('aws-sdk');
const {Storage} = require('@google-cloud/storage');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
app.use(busboy());

const publicKey = 'ASIATVWBNAOCJYSEHWRG'; // Update the keys
const secretKey = 'yQypGq5wHKvgj8/xzIL3rbVnZAoJUKLp07ublnHc';
const sessionToken = 'FQoGZXIvYXdzEJL//////////wEaDDsffqeLXBSdCsoHJiKWAsHU7kt2TvdoBResCmnKoRm1VkE/HRLWEh6QGrMz6L4yX6NbiEF5xjIx4GhUOaYJ+mtLh4917Owne0ZLsnT1Jo9ZVLKTwuOq0MQvfybSPQX8+kY+CqWgvE0yXwXpbrr+7YYn4JWMKALEiJXqvGZdA4byKCxAHQ4ri7x7WBXnC2ATgLz0/vRH6mlj7RX4BusAt05ICwe9Fh9HEexUId1yJWq4mOSFXh9br8DQKoXGWNDmG+6rjRs+BIX6grZyZT99cLq3j3SDSfbxdzpLosPFn5VzB9gSIC42l9c+g3+Pwt5OY+AsV8jWthJcwXL+eMLh2sL3V1Gdk0yLTbFZHhulw5ZEUKrLwDizz8fk/efnwQCARMrKxfntKMCyou0F';

const GOOGLE_CLOUD_PROJECT_ID = ''; // Replace with your project ID
const GOOGLE_CLOUD_KEYFILE = ''; // Replace with the path to the downloaded private key

const s3 = new AWS.S3(
 {accessKeyId: publicKey, secretAccessKey: secretKey, sessionToken: sessionToken}
);
// const storage = new Storage({
//     projectId: GOOGLE_CLOUD_PROJECT_ID,
//     keyFilename: GOOGLE_CLOUD_KEYFILE,
//   });

var con = mysql.createConnection({
  host: "", user: "",
  password: "",
  port: "3306",
  database: "innodb"
});

app.post('/', function(req , res){
  if((req.body.name==="")||(req.body.age==="")||(req.body.work==="")||(req.body.salary==="")||(req.body.email==="")){
    res.send("false");
  }
  else{
    fs.appendFile('mynamefile.txt',JSON.stringify(req.body),function (err){
      if (err) throw err;
      console.log('saved!!!');
    });
    con.query("insert into employee values(?,?,?,?,?)", [req.body.name,req.body.age,req.body.work,req.body.salary,req.body.email],function (err, result) {
      if (err) throw err;
      console.log("Data created");
      console.log(result);
    });
    res.send('true');
  }
});

app.post('/fileupload', function(req, res) {
    var fstream,responce=false;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        const params = {
          Bucket: '',
          Key: (filename),
          Body: file
        };
        // fstream = fs.createWriteStream(filename);
        // file.pipe(fstream);
        s3.upload(params, function(s3Err, data) {
          if (s3Err) {
              console.log("Error uploading data: ", s3Err);
            } else {
              console.log("Successfully uploaded data");
            }
        });
        // storage.bucket('yogesh5466').upload(filename,function(s3Err, data) {
        //   if (s3Err) {
        //       console.log("Error uploading data: ", s3Err);
        //     } else {
        //       console.log("Successfully uploaded data");
        //     }
        //   });
        responce=true;
    });
    req.busboy.on('finish', function () {
        res.send(responce);
    });
});


app.listen(3001, () => {
  console.log('Server started');
});
