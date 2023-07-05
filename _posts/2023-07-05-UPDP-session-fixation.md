---
layout: post
title: Un Poco de Pentesting - Session Fixation
author: c4rta
date: 2023-07-05
##categories: [Maquinas, HackTheBox]
tags: [Session Fixation]
---
Te explicare como funciona el ataque Session Fixation con el que podremos robar/secuestrar la sesion de otra persona
{:.lead}

## Sesiones

De acuerdo a google las sesiones son:

> Una sesion de un grupo de interacciones del usuario con un sitio web que tienen lugar dentro de un marco de tiempo determinado, Por ejemplo, una sola sesion puede contener varias vistas de pagina, eventos, interacciones sociales y transacciones de comercio electronico.

![](https://lh3.googleusercontent.com/jYib9rNgrLOavCGfEaMPqJNOIf6cN5aHqsZpXAKPP1IVOUM3iFImIIxMW_AnWHlI5xKJ=w1100)
<center>Imagen de: Google Analytics</center>

Y es correcto, en una sesion se puede almacenar informacion sobre lo que un usuario hizo en un sitio web, ademas cabe recalcar que la sesion se crea una vez que primero el usuario se haya autenticado en el sitio web, por lo regular duran 30 minutos o hasta media noche (esto puede varias si el programador lo desea)

### Session Authentication

La autenticacion basada en sesiones es un metodo para crear una sesion para cada usuario que se haya autenticado donde se almacenada informacion del lado del servidor en un "session ID".

**Funciona de esta manera:**

1. El cliente envia una solicitud de inicio de sesion o alguna informacion que pida

2. El servidor autentica al usuario, crea una sesion que contendra la informacion de inicio de sesion u otra que haya pedido (se almacena en la base de datos y devuelve un session ID)

3. El cliente cuando vuelva a conectarse envia el sessionID en los encabezados de peticion

4. El servidor comprueba si el sessionID que le envio el cliente tiene informacion valida, en caso de que sea exitoso el servidor web autentica el usuario

**Ejemplos de encabezados HTTP:**

- Encabezado de respuesta

    ```bash
    HTTP/1.1 200 OK
    Content-Type: text/html
    Set-Cookie: SESSIONID=identificador_de_sesion
    ```
    Observa como a travez del header ```Set-Cookie``` el servidor le asigno al usuario una sesion con su identificacion

- Encabezado de peticion

    ```bash
    GET /recurso HTTP/1.1
    Host: ic4rta.github.io
    Cookie: SESSIONID=identificador_de_sesion
    ```
    Observa que cuando se hace una peticion, en el header ```Cookie``` se le debe de indicar el session ID con su identificador

## Session Fixation

El session fixation es una tecnica donde se obliga a usar a la victima a usar un ```session ID``` creado por el atacante con el fun de que la victima se autentique usando ese mismo ```session ID```, y el atacante pueda usar ese mismo ```session ID``` para iniciar sesion como si fuera la victima.
Y ya con esto el atacante pudo robar/secuestrar la sesion de la victima

Algunas consideraciones son que:

- El atacante cree un ```session ID``` valido
- El ataque comienza antes de que la victima inicie sesion en el sitio web

### Ejemplo

![](https://compsecurityconcepts.files.wordpress.com/2013/11/session-fixation.png)

<center>Imagen de: IT Security Concepts Wordpress</center>

1. El atacante inicia sesión en el banco

2. El servidor a travez de los encabezados de respuesta le asigna un session ID el cual es válido (session ID: 2435345)

3. El atacante le envía una URL a la víctima con el session ID que generó el atacante

4. La víctima entra a la URL

5. La víctima se auténtica usando el session ID del atacante(session ID: 2435345) e inicia sesión usando sus credenciales, y ahora ese session ID ya tiene información de la sesión de la víctima (las credenciales en este caso, pero puede tener más cosas)

6. El atacante puede usar ese session ID para iniciar sesión en la cuenta de la víctima

Referencias:

- [https://owasp.org/www-community/attacks/Session_fixation](https://owasp.org/www-community/attacks/Session_fixation)
- [https://secureteam.co.uk/articles/web-application-security-articles/understanding-session-fixation-attacks/](https://secureteam.co.uk/articles/web-application-security-articles/understanding-session-fixation-attacks/)


