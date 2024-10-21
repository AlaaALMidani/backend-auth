// const bodyParser = require('body-parser');
// const express = require('express')
// const path = require('path')
// const fs = require('fs');

// const app = express()
// const port =3000
// let filePath= path.join(__dirname ,'index.html')

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());


// app.get ('/',(req,res) =>{
//     let data =[]
//     if (fs.existsSync(filePath)){
//         const rawData= fs.readFileSync(filePath)
//         data = JSON.parse(rawData);
//     }res.send (data);
// })

// app.post('/submit',(req,res) =>{                                                                                                                                
//     const formData =(req.body)
//     let data = [];
//     if (fs.existsSync(filePath)) {
//         const rawData = fs.readFileSync(filePath);
//         data = JSON.parse(rawData);
//     }
//         res.send(data)
// })



// app.listen(port)