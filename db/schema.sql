-- create Database
CREATE DATABASE gravyapie;

-- connect to database
\c gravyapie

-- create table for database
CREATE TABLE servos (
    id SERIAL PRIMARY KEY,
    name TEXT,
    owner TEXT,
    street_address TEXT,
    suburb TEXT,
    state TEXT,
    latitude FLOAT,
    longitude FLOAT    
);

-- INSERT into servos (name, owner, street_address, suburb, state, latitude, longitude) values ('a', 'a', 'a', 'a', 'a', '1', '1');