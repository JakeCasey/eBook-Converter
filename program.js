var express = require('express');
var app = express();
var fs = require('fs');





var path = require('path');
// npm ebook-convert
var convert = require('ebook-convert');
// npm multer
var multer = require('multer');

//defines how to store and name uploaded files.
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, __dirname +'/uploads/tmp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var multer = multer({storage : storage, fileFilter: 
    function(req, res, cb){
        
        var patt = new RegExp(/\.(mobi|epub|html|pdf)$/i);
        var ext = patt.test(res.originalname);
  
        if(ext){
            cb(null, true);
        }
        else{
            cb(new Error("Please upload a book in .mobi, .epub, .html, or .pdf format."));
        }
    }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/'));


//render index
app.get('/', function(req, res){

    res.render('index', {button : ''});
});

var upload = multer.single('up')

app.post('/uploads', upload,  function(req, res){
    
    
    upload(req, res, function(err){
        if(err){
            
            
            return err;
        }
        
    })

// make name appropriate
var name = req.file.originalname.match(/[^.]*/);
    name = __dirname + '/uploads/'+ name[0] + '.mobi'



//convert to mobi.   
var epub = convert({
  source: req.file.path,
  target: name
});


//make download button appear and delete uploaded file.
// then set local name for use with download button.
epub.on('exit', function(){
        var button = true;
        fs.unlink(req.file.path);
        res.render('index', { button : button});
        app.locals.name = name;

    });
    
 
    

});

//download book and delete downloaded file.
app.get('/download', function(req, res){
       res.download(app.locals.name, function(){
           fs.unlink(app.locals.name);
       });

      
       
       

});


//start app.
app.listen(8080);