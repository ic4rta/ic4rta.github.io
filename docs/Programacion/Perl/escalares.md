---
layout: default
title: Escalares
parent: Perl
grand_parent: Programacion
---

# Escalares
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Variables
**my**: Se usa para declarar variables con un alcance definido, como lo puede ser dentro de una funcion

```perl
sub funcion {
	my $var = "Variable local";
}
```
**our**: Se usa para declarar variables globales que sen visibles desde otros archivos que se encuentran en el mismo paquete

```perl
package paquete;
our $var = "Variable con our";
```
### Escalares

Es una unidad de datos que puede ser entero, flotante, caracter o cadena. Se declaran con un ```$``` al inicio
```perl
$var_1 = "Variable 1";
$var_2 = 12.4;
$var_3 = 'Se interpreta literal';
```
### Cadenas multilinea

Se usa para definir multiples lineas en una misma variable
```perl
$string = 'Variable
multilinea';

$string_2 <<EOF;
Variable
Multilinea
EOF
```
### Escalares especiales

Son variables que representan diferente informacion del codigo fuente
```perl
$linea_actual = __LINE__;
$nombre_archivo = __FILE__;
```
