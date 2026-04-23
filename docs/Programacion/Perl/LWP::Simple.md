---
layout: default
title: LWP::Simple
parent: Perl
grand_parent: Programacion
---

# LWP::Simple
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

LWP:Simple es un modo que permite hacer peticiones de la manera mas simplificada con la desventaja que no tenemos tanto control sobre los encabezados y la peticion

## Obtener contenido (GET)
La manera mas facil es usando el metodo ```get(url)```, regresa el contenido (string) si la petición se hizo correctamente, y ```undef```si no se pudo hacer
```perl
use LWP::Simple;

my $respuesta = get("https://ic4rta.github.io/");
print $respuesta;
```
Si se desea verificar si la peticion se hizo correctamene podemos hacerlo de las siguientes formas
> **if**

Podemos hacer un if, para verificar si la respuesta no tiene contenido o es false

```perl
use LWP::Simple;

my $respuesta = get("https://ic4rta.github.i/");

if ($respuesta){
	print $respuesta;
}else{
	die "No se pudo hacer la peticion";
}
```

> **Operador ?**

Otra forma es usando el operador ternario, que ya vimos como funciona en la parte de condicionales
```perl
(defined $respuesta) ? print $respuesta : die "No se pudo hacer la peticio";
```
Primero con ```defined``` se verifica si ```$respuesta``` esa definida, es decir, si tiene algun valor, en caso de que sea true, hace el ```print```, si no, ejecuta el ```die```

> **unless**

En este primera forma si ```$respuesta``` esta definida (true), la condicion ```unless defined $respuesta;``` sera falsa y el script continua la ejecucion. Si ```$respuesta```no esta definida (false, es undef), la condicion ```unless defined $respuesta;``` se evalua como verdadera y se ejecuta el ```die```

```perl
die "No se pudo hacer la peticion" unless defined $respuesta;
```

Otra forma se usar ```unless```se una manera mas legible es:
```perl
unless ($respuesta){
	die "No se pudo haecr la peticion"
}
unless ($respuesta) { die "No se pudo haecr la peticion" } #lo mismo
```

### getprint
Este metodo hace una peticion GET y imprime su contenido en el STDOUT, este metodo solo es util cuando se desea obtener de manera rapida el contenido y no se quiere procesar la peticion antes

```perl
getprint("https://ic4rta.github.io")
```

## Peticion POST
Podemos usar el modulo ```LWP::Simple::Post```, sin embargo, la propia documentacion no recomienda usar ese modulo ya que tiene mas desventajas que ```LWP::UserAgent```

```perl
use LWP::Simple::Post qw(post);
use JSON;

my $url = "https://jsonplaceholder.typicode.com/posts";

my $datos = {
    "userID" => 1,
    "id" => 1,
    "title" => "Una peticion post",
    "body" => "ola"
};

my $datos_json = encode_json($datos);
print post($url, $datos_json);
```
El metodo post devuelve ```undef```si fue fallido, en este caso se usa el modulo JSON por que la URL espera un JSON

## Obtener encabezados
Para trabajar con encabezados usamos el metodo ```head(url)```, esto retorna 6 valores en una lista si se realiza correctamente: content_type, document_length, modified_time, expires, server y code, en el contexto de valores escalares, regresa true si es satisfactoria

### Obtener codigo de estado

```perl
use LWP::Simple;

my $url = "https://ic4rta.github.io/";
my $encabezados = head($url);
print $encabezados->code;
```

Si queremos combinar una peticion GET y verificar el codigo de estado con un if podemos hacer esto
```perl
use LWP::Simple;

my $url = "https://ic4rta.github.io/";

my $encabezados = head($url);
my $respuesta = get($url);

if ($encabezados->code == 200){
	print $respuesta;
}
```
Tambien podemos llamar directamente la funcion ```head```sin necesidad de asignar el valor de regreso a una variable, para acortar codigo es recomendable aun que la claridad puede ser mas "complicada"

```perl
use LWP::Simple;

my $url = "https://ic4rta.github.io/";
my $respuesta = get($url);

if (head($url)->code == 200){
	print $respuesta;
}
```
Con unless

```perl
use LWP::Simple;

my $url = "https://ic4rta.github.io/";
my $respuesta = get($url);

unless (head($url)->code == 200){
	die "El codigo de estado no es 200"; #sale del script
}

print $respuesta;
```