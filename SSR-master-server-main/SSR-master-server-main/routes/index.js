var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

/* ──────────────────────────────────────────
   GET /record  (parámetros por query string)
   Ejemplo: /record?id_nodo=Nodo1&temperatura=24.5&...
────────────────────────────────────────── */
router.get('/record', function(req, res, next) {
  var now = new Date();
  var logfile_name = __dirname + '/../public/logs/' +
    req.query.id_nodo + "-" +
    now.getFullYear() + "-" +
    now.getMonth() + "-" +
    now.getDate() + '.csv';

  var line = req.query.id_nodo + ';' + now.getTime() + ";" +
    req.query.temperatura + ";" +
    req.query.humedad + ";" +
    req.query.co2 + ";" +
    req.query.volatiles + "\r\n";

  fs.stat(logfile_name, function(err, stat) {
    if (err == null) {
      console.log('File %s exists', logfile_name);
      append2file(logfile_name, line);
    } else if (err.code === 'ENOENT') {
      var header = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n';
      append2file(logfile_name, header + line);
    } else {
      console.log('Some other error: ', err.code);
    }
  });

  res.send("GET - Saving: " + line + " in: " + logfile_name);
});

/* ──────────────────────────────────────────
   POST /record  (parámetros en el body JSON)
   Body esperado:
   {
     "id_nodo":     "NuevaPrueba",
     "temperatura": 24.5,
     "humedad":     55,
     "co2":         400,
     "volatiles":   15
   }
────────────────────────────────────────── */
router.post('/record', function(req, res, next) {
  var now = new Date();

  // Los datos llegan en req.body gracias a express.json()
  var id_nodo     = req.body.id_nodo;
  var temperatura = req.body.temperatura;
  var humedad     = req.body.humedad;
  var co2         = req.body.co2;
  var volatiles   = req.body.volatiles;

  // Validación básica
  if (!id_nodo) {
    return res.status(400).send("Error: falta el campo id_nodo en el body.");
  }

  var logfile_name = __dirname + '/../public/logs/' +
    id_nodo + "-" +
    now.getFullYear() + "-" +
    now.getMonth() + "-" +
    now.getDate() + '.csv';

  var line = id_nodo + ';' + now.getTime() + ";" +
    temperatura + ";" +
    humedad + ";" +
    co2 + ";" +
    volatiles + "\r\n";

  fs.stat(logfile_name, function(err, stat) {
    if (err == null) {
      console.log('File %s exists', logfile_name);
      append2file(logfile_name, line);
    } else if (err.code === 'ENOENT') {
      var header = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n';
      append2file(logfile_name, header + line);
    } else {
      console.log('Some other error: ', err.code);
    }
  });

  res.status(200).send("POST - Saving: " + line + " in: " + logfile_name);
});

/* ──────────────────────────────────────────
   Función auxiliar para escribir en el CSV
────────────────────────────────────────── */
function append2file(file2append, content) {
  fs.appendFile(file2append, content, function(err) {
    if (err) throw err;
    console.log("Saving: " + content + " in: " + file2append);
  });
}

module.exports = router;