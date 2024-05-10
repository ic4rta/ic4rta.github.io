---
layout: default
title: Abuse Hop-by-Hop Headers
parent: Tecnicas
---

# Abuse Hop-by-Hop Headers
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Los encabezados Hop-By-Hop estan diseñados para ser procesador y utlizados por un proxy para una unica conexion. Unas caracteristicas es que estos no estan diseñados para que sean renviados por el proxy, ni para que se almacenen en cache.
De forma predeterminada los encabezados Hop-by-Hop son:
- **Keep-Alive:** Indica cual sera el tiempo de vida de la conexion, puede tener estos dos argumentos:
	- ```timeout```: Indica el tiempo en segundos en que la conexion se debe de mantener activa
	- ```max```: Indica el numero maximo de peticiones que se pueden enviar en esa misma conexion
- **Conection:** Indica si la conexion  de red debe permanecerse activa despues que realizar la peticion web. Los valores que puede tener son:
	- ```close```: Para terminar la conexion
	- ```keep-alive```: Para que permanezca abierta
- **Transfer-Encoding**: Indica el formato de codificacion de la peticion web, puede tener los valores
	- ```chunked```: Los datos se envian por partes, separandolos por ```\r\n```
	- ```compress```: Comprime los datos usando el algoritmo Lempel–Ziv–Welch
	- ```deflate```: Usa el algoritmo de compresion deflate de zlib
	- ```identity```: Indica una entidad, es decir, que no usa compresion ni codificacion
- **TE**: Tambien llamado ```Accept-Transfer-Encoding```, lo envia el cliente para indicar el tipo de condificacion que aceptara 
- **Trailer:** Indica informacion adicional al usar el ```Transfer-Encoding: chunked```
- **Upgrade:** Sirve para actualizar una conexion ya establecida a otro protocolo, por ejemplo, actualizar ```HTTP 1.1``` a ```HTTP 2.0``` 

- **Proxy-Authorization:** Contiene credenciales  para autenticar un ```User-Agent```a un servidor proxy, es un encabezado de peticion:
	- Proxy-Authorization: \<tipo_autenticacion> \<credenciales>
- **Proxy-Authenticate:** Define el metodo de autenticacion que debe de usar el cliente

### Practica
Los encabezados Hop-By-Hop solo se pueden definir despues de ```Conection```:
```perl
Connection: close, X-Forwarded-For
```

Esto lo que hara es que el proxy los eliminara ```X-Forwarded-For``` de la peticion antes de pasarla el backend

El abuso de estos encabezados se basa en eliminar encabezados que no estaban en la peticion original, pero que se agregaron para que el proxy los elimine, esto puede ocasionar una respuesta inesperada

### Bypass X-forwarded-For
Estamos en un escenario donde queremos acceder al endpoint ```/accounts/admin```pero al hacerlo nos da un HTTP 403 por que se usa el encabezado ```X-forwarded-For```

Para poder hacer bypass de esto primero debemos de agregar el encabezado ```X-forwarded-For``` en ```Connection```

```perl
Connection : Close,X-forwarded-For
```
Lo que pasara es que el proxy eliminara ```X-forwarded-For```, por lo que el backend no lo contendra, evitando que se especifique una direccion IP para acceder al endpoint, y podamos acceder a el
