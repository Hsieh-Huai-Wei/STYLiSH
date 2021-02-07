# STYLiSH

Build e-commerce websites by AWS service, including catalog and classification, product search function, shopping cart system and login system. 

#### Website URL: https://www.raymond0116.xyz/ 
( Recommended browser : Chrome )

## Table of content
* [Technologies](#Technologies)
* [Structure](#Structure)
* [Database design](#Database-design)
* [Features](#Features)
* [Demonstration](#Demonstration)
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
![Example screenshot](https://i.imgur.com/tujRnTa.png)

## Features
* Built server on AWS EC2 with NGINX and handled the varying load of application traffic by AWS ELB.
* Used AWS S3 to stored product images, and the reduced response time through AWS CDN.
* Optimized MySQL schema by Normalization, Foreign Key and Index.
* Constructed RESTful API for product details, orders, payments and user information.
* Optimized data response efficiency through in-memory cache mechanism by Redis.
* Performed server load testing by artillery.
* Integrated Facebook login via JavaScript SDK and Graph API.
* Integrated TapPay SDK (third-party payment API) for credit card payment feature.

## Demonstration
### Login/Sign-up page

![Structure screenshot](https://i.imgur.com/Tn5GS9X.png)

* Use normal login or third-party login (facebook).

### Main page

![Demo Home Page alpha](https://i.imgur.com/AOLvLfh.png)

* Use the category or search function to find specific products.

### Product detail page

![Structure screenshot](https://i.imgur.com/koEiXao.png)

* Select different colors and sizes to correspond to different stock quantities.

### Cart page

![Structure screenshot](https://i.imgur.com/jyuXlDX.png)
![Structure screenshot](https://i.imgur.com/Gao0CAH.png)

* Make quantity changes and delete product.
* Choose cash on delivery or credit card payment.

## Author
Hsieh-Huai-Wei [@Hsieh-Huai-Wei](https://github.com/Hsieh-Huai-Wei)