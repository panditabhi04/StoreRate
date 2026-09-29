CREATE DATABASE store_rating_db;
use store_rating_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role ENUM('ADMIN', 'USER', 'OWNER') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_name (name),
    INDEX idx_users_address (address),
    INDEX idx_users_role (role)
);

CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_store_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_stores_name (name),
    INDEX idx_stores_address (address),
    INDEX idx_stores_owner_id (owner_id)
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_rating_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rating_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT unique_user_store_rating
        UNIQUE (user_id, store_id),
        
	INDEX idx_ratings_user_id (user_id),
    INDEX idx_ratings_store_id (store_id)
);

INSERT INTO users (name, email, password, address, role)
VALUES
(
    'Rushikesh Patil Admin',
    'admin@storerate.com',
    '$2b$10$examplehashedpassword1',
    'Pune, Maharashtra',
    'ADMIN'
),
(
    'Abhishek Pandit Owner',
    'owner1@storerate.com',
    '$2b$10$examplehashedpassword2',
    'Mumbai, Maharashtra',
    'OWNER'
),
(
    'Rahul Patil Normal User',
    'rahul@user.com',
    '$2b$10$examplehashedpassword3',
    'Pune, Maharashtra',
    'USER'
),
(
    'Amit Mule Normal User',
    'amit@user.com',
    '$2b$10$examplehashedpassword4',
    'Sangali, Maharashtra',
    'USER'
),
(
    'Priya Kokani Normal User',
    'priya@user.com',
    '$2b$10$examplehashedpassword5',
    'Ratnagiri, Maharashtra',
    'USER'
);

INSERT INTO stores (name, email, address, owner_id)
VALUES
(
    'ABC Super Market',
    'abc@gamil.com',
    'Kothrud, Pune, Maharashtra',
    6
),
(
    'Fresh Mart Store',
    'freshmart@gmail.com',
    'Baner, Pune, Maharashtra',
    6
),
(
    'City Grocery Store',
    'citygrocery@gmail.com',
    'Viman Nagar, Pune, Maharashtra',
    7
    ),
(
    'Bigmart Grocery Store',
    'Bigmart@gmail.com',
    'Viman Nagar, Pune, Maharashtra',
    8
);
INSERT INTO ratings (user_id, store_id, rating)
VALUES
(3, 1, 5),
(4, 1, 4),
(5, 1, 5),

(3, 2, 4),
(4, 2, 3),

(5, 3, 5),
(3, 3, 4);

select * from users;
select * from stores;
select * from ratings;






