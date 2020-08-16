CREATE DATABASE
IF NOT EXISTS stylish;

USE stylish;
CREATE TABLE `attributes`
(
`id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`class` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
PRIMARY KEY
(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE stylish;
CREATE TABLE `product`
(
`id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`number` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`attributes_id` int
(25) unsigned NOT NULL ,
`title` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`description` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`price` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`texture` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`wash` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`place` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`note` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`story` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`main_image` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`images` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
PRIMARY KEY
(`id`),
CONSTRAINT fk_attributes FOREIGN KEY
(attributes_id)
REFERENCES attributes
(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


USE stylish;
CREATE TABLE `color`
(
`id` int
(255) unsigned NOT NULL AUTO_INCREMENT,
`code` varchar
(50) NOT NULL,
`name` varchar
(50) NOT NULL,
PRIMARY KEY
(`id`),
UNIQUE KEY
(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE stylish;
CREATE TABLE `size`
(
`id` int
(255) unsigned NOT NULL AUTO_INCREMENT,
`size` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
PRIMARY KEY
(`id`),
UNIQUE KEY
(`size`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




USE stylish;
CREATE TABLE `variants`
(
`id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`color_id` int
(25) unsigned NOT NULL ,
`size_id` int
(25) unsigned NOT NULL ,
`product_id` int
(25) unsigned NOT NULL ,
`stock` int
(25) COLLATE utf8mb4_unicode_ci NOT NULL,
PRIMARY KEY
(`id`),
CONSTRAINT fk_product FOREIGN KEY
(product_id)
REFERENCES product
(id),
CONSTRAINT fk_color FOREIGN KEY
(color_id)
REFERENCES color
(id),
CONSTRAINT fk_size FOREIGN KEY
(size_id)
REFERENCES size
(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


USE stylish;
CREATE TABLE `campaigns`
(
`id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`product_id` int
(25) unsigned NOT NULL ,
`picture` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`story` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
PRIMARY KEY
(`id`),
CONSTRAINT fkm_product FOREIGN KEY
(product_id)
REFERENCES product
(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE stylish;
CREATE TABLE `provider`
(
 `id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`provider` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
 PRIMARY KEY
(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE stylish;
CREATE TABLE `user`
(
 `id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`number` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`name` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
 `email` varchar
(100) COLLATE utf8mb4_unicode_ci NOT NULL,
 `password` varchar
(50) COLLATE utf8mb4_unicode_ci,
`picture` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
`provider_id` int
(25) unsigned NOT NULL,
`access_token` varchar
(255) COLLATE utf8mb4_unicode_ci NOT NULL,
 `access_expired` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
 PRIMARY KEY
(`id`),
 UNIQUE KEY `email`
(`email`),
CONSTRAINT provider FOREIGN KEY
(provider_id)
REFERENCES provider (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



USE stylish;
CREATE TABLE `orders`
(
 `id` int
(25) unsigned NOT NULL AUTO_INCREMENT,
`order_number` varchar
(25) COLLATE utf8mb4_unicode_ci NOT NULL,
`user_id` int
(25) unsigned NOT NULL,
`payment_status` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
`price` varchar
(50) COLLATE utf8mb4_unicode_ci NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `order_number` (`order_number`),
 CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT *
FROM stylish.color;
INSERT INTO color
  (code, name)
VALUES
  ("334455", "深藍"),
  ("FFFFFF", "白色"),
  ("BFC8D7", "藍色"),
  ("E2D2D2", "粉色"),
  ("E3E2B4", "黃色"),
  ("A2B59F", "綠色");


SELECT *
FROM stylish.size;
INSERT INTO size
  (size)
VALUES
  ("S"),
  ("M"),
  ("L"),
  ("X"),
  ("XL");

SELECT *
FROM stylish.attributes;
INSERT INTO attributes
  (class)
VALUES
  ("women"),
  ("men"),
  ("accessories");

SELECT *
FROM stylish.provider;
INSERT INTO provider
  (provider)
VALUES
  ("native"),
  ("facebook");

-- SELECT *
-- FROM stylish.product;
-- INSERT INTO product
-- VALUES
-- (1,'201807201824',1,'前開衩扭結洋裝','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.799','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827134345-715118737.jpeg','1590827134350-885124358.jpeg,1590827134352-144319391.jpeg'),(2,'201807202140',1,'透肌澎澎防曬襯衫','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.599','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827243830-994099400.jpeg','1590827243832-393019487.jpeg,1590827243833-902856290.jpeg'),(3,'201807202150',1,'小扇紋細織上衣','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.599','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827292674-248979503.jpeg','1590827292676-826644056.jpeg,1590827292677-186118554.jpeg'),(4,'201807202157',1,'活力花紋長筒牛仔褲','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.1299','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827344203-299439522.jpeg','1590827344204-327387193.jpeg,1590827344206-659839766.jpeg'),(5,'201807242211',2,'純色輕薄百搭襯衫','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.799','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827399373-302864087.jpeg','1590827399373-344633978.jpeg,1590827399375-256686939.jpeg'),(6,'201807242216',2,'時尚輕鬆休閒西裝','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.799','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590827446455-483906798.jpeg','1590827446460-552847126.jpeg,1590827446461-932535199.jpeg'),(7,'201807242222',2,'經典商務西裝','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.','TWD.3999','棉 100%/厚薄：薄/彈性：無','手洗，溫水','中國','實品顏色依單品照為主','你絕對不能錯過的超值商品','1590830018025-242200901.jpeg','1590830018028-155380131.jpeg,1590830018031-806375983.jpeg');

-- SELECT *
-- FROM stylish.campaigns;
-- INSERT INTO campaigns
-- VALUES
-- (1,2,'1590834234634-573971360.jpeg','於是/我也想要給你/一個那麼美好的自己/不朽《與自己和好如初》');