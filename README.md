# STYLiSH

E-commerce

#### Website URL: https://www.raymond0116.xyz/ 
( Recommended browser : Chrome )

## Table of content
* [Technologies](#Technologies)
* [Structure](#Structure)
* [Database design](#Database-design)
* [Features](#Features)
* [Author](#Author)

## Technologies

### Backend

* Linux
* Node.js / Express.js
* NGINX

### Frontend

* JavaScript ( ES6 )
* HTML
* CSS

### Database

* MySQL
* Redis ( Cache )

### Cloud Service(AWS)

* Compute: EC2
* Storage: S3
* Database: RDS
* Network: ELB

### Library

* JWT

### Tools for development

* Version Control: Git, GitHub
* Test: Artillery

### Networking

* HTTP & HTTPS
* Domain Name System (DNS)
* Cloudflare
* RESTful API
* fetch

## Structure
![Structure screenshot](https://i.imgur.com/99uR9m0.png)

## Database design
![Example screenshot](https://i.imgur.com/GfHel7r.png)

## Features
![Demo Home Page alpha](https://i.imgur.com/AOLvLfh.png)
* Built server on AWS EC2 with NGINX and handled the varying load of application * * traffic by AWS ELB.
* Used AWS S3 to stored product images, and the reduced response time through AWS CDN.
* Optimized MySQL schema by Normalization, Foreign Key and Index.
* Constructed RESTful API for product details, orders, payments and user information.
* Optimized data response efficiency through in-memory cache mechanism by Redis.
* Performed server load testing by artillery.
* Integrated Facebook login via JavaScript SDK and Graph API.
* Integrated TapPay SDK (third-party payment API) for credit card payment feature.

## Author
Hsieh-Huai-Wei [@Hsieh-Huai-Wei](https://github.com/Hsieh-Huai-Wei)