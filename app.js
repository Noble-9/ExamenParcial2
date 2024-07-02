const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a la base de datos
const db = new sqlite3.Database(':memory:');

// Crear tablas y datos iniciales
db.serialize(() => {
    db.run('CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, apellido TEXT, fecha_nacimiento TEXT)');
    db.run('CREATE TABLE libros (id INTEGER PRIMARY KEY, titulo TEXT, fecha_publicacion TEXT, autor_id INTEGER, precio REAL, FOREIGN KEY (autor_id) REFERENCES autores (id))');
    
    db.run('INSERT INTO autores (nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?)', ['Gabriel', 'García Márquez', '1927-03-06']);
    db.run('INSERT INTO autores (nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?)', ['Isabel', 'Allende', '1942-08-02']);
    db.run('INSERT INTO libros (titulo, fecha_publicacion, autor_id, precio) VALUES (?, ?, ?, ?)', ['Cien Años de Soledad', '1967-05-30', 1, 20.99]);
    db.run('INSERT INTO libros (titulo, fecha_publicacion, autor_id, precio) VALUES (?, ?, ?, ?)', ['La Casa de los Espíritus', '1982-10-12', 2, 15.99]);
});

// Rutas para autores
app.get('/autores', (req, res) => {
    db.all('SELECT * FROM autores', (err, rows) => {
        if (err) throw err;
        res.render('autores/index', { autores: rows });
    });
});

app.get('/autores/nuevo', (req, res) => {
    res.render('autores/nuevo');
});

app.post('/autores/nuevo', (req, res) => {
    const { nombre, apellido, fecha_nacimiento } = req.body;
    if (!nombre || !apellido || !fecha_nacimiento) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }
    db.run('INSERT INTO autores (nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?)', [nombre, apellido, fecha_nacimiento], (err) => {
        if (err) throw err;
        res.redirect('/autores');
    });
});

app.get('/autores/editar/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM autores WHERE id = ?', [id], (err, row) => {
        if (err) throw err;
        res.render('autores/editar', { autor: row });
    });
});

app.post('/autores/editar/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, fecha_nacimiento } = req.body;
    db.run('UPDATE autores SET nombre = ?, apellido = ?, fecha_nacimiento = ? WHERE id = ?', [nombre, apellido, fecha_nacimiento, id], (err) => {
        if (err) throw err;
        res.redirect('/autores');
    });
});

app.post('/autores/eliminar/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM autores WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/autores');
    });
});

// Rutas para libros
app.get('/libros', (req, res) => {
    const search = req.query.search || '';
    db.all('SELECT libros.*, autores.nombre || " " || autores.apellido AS autor FROM libros JOIN autores ON libros.autor_id = autores.id WHERE libros.titulo LIKE ? OR autores.nombre LIKE ? OR autores.apellido LIKE ?', [`%${search}%`, `%${search}%`, `%${search}%`], (err, rows) => {
        if (err) throw err;
        res.render('libros/index', { libros: rows });
    });
});

app.get('/libros/nuevo', (req, res) => {
    db.all('SELECT * FROM autores', (err, autores) => {
        if (err) throw err;
        res.render('libros/nuevo', { autores: autores });
    });
});

app.post('/libros/nuevo', (req, res) => {
    const { titulo, fecha_publicacion, autor_id, precio } = req.body;
    if (!titulo || !fecha_publicacion || !autor_id || !precio) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }
    db.run('INSERT INTO libros (titulo, fecha_publicacion, autor_id, precio) VALUES (?, ?, ?, ?)', [titulo, fecha_publicacion, autor_id, precio], (err) => {
        if (err) throw err;
        res.redirect('/libros');
    });
});

app.get('/libros/editar/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM libros WHERE id = ?', [id], (err, libro) => {
        if (err) throw err;
        db.all('SELECT * FROM autores', (err, autores) => {
            if (err) throw err;
            res.render('libros/editar', { libro: libro, autores: autores });
        });
    });
});

app.post('/libros/editar/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, fecha_publicacion, autor_id, precio } = req.body;
    db.run('UPDATE libros SET titulo = ?, fecha_publicacion = ?, autor_id = ?, precio = ? WHERE id = ?', [titulo, fecha_publicacion, autor_id, precio, id], (err) => {
        if (err) throw err;
        res.redirect('/libros');
    });
});

app.post('/libros/eliminar/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM libros WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/libros');
    });
});

// Inicio
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
