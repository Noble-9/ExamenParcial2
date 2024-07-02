-- database.sql
CREATE TABLE autores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    fecha_nacimiento DATE
);

CREATE TABLE libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha_publicacion DATE,
    autor_id INTEGER,
    precio REAL,
    FOREIGN KEY (autor_id) REFERENCES autores (id)
);

-- Insertar datos iniciales
INSERT INTO autores (nombre, apellido, fecha_nacimiento) VALUES 
('Gabriel', 'García Márquez', '1927-03-06'),
('Isabel', 'Allende', '1942-08-02');

INSERT INTO libros (titulo, fecha_publicacion, autor_id, precio) VALUES 
('Cien años de soledad', '1967-05-30', 1, 20.99),
('La casa de los espíritus', '1982-11-10', 2, 15.99);

SELECT * From autores