---
layout: default
title: Argumentos de CLI
parent: Perl
grand_parent: Programacion
---

# Argumentos de CLI
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Para manejar argumentos se hace uso de ```@ARGV``` el cual es una lista
##  Uso

```perl
sub mul{
	my ($numero_1, $numero_2) = @_;
	return $numero_1 * $numero_2;
}
my ($numero_1, $numero_2) = @ARGV;
print mul($numero_1, $numero_2);
```
En este ejemplo el script recibe los argumentos ```$numero_1, $numero_2```, en este caso, el argumento ```$numero_1```es el argumento 1, el ```$numero_2``` es el argumento 2 y asi sucesivamente
- Podemos indicar la cantidad de argumentos que sean pero separados por comas
- No importa el tipo de dato escalar que se le pase como argumento


### Validar el paso de argumentos

Validar si se pasa cierta cantidad de argumentos:

```perl
sub mul{
	my ($numero_1, $numero_2) = @_;
	return $numero_1 * $numero_2;
}

unless (@ARGV == 2){
	die "Debes de ingregar dos argumentos"
}

my ($numero_1, $numero_2) = @ARGV;
print mul($numero_1, $numero_2);
```
Otra forma de hacerlo es:

```perl
if (@ARGV != 2) {
    die "Usage: $0 <arg1> <arg2>\n";
}
```
Y usando el operador ```?```:

```perl
sub mul{
	my ($numero_1, $numero_2) = @_;
	return $numero_1 * $numero_2;
}

sub main{
	my ($numero_1, $numero_2) = @ARGV;
	print mul($numero_1, $numero_2);
}

(@ARGV == 2) ? main() : die "Se requieren exactamente dos argumentos.\n";
```
En este caso es necesario definir una función extra que se ejecutara cuando la condición sea verdadera (se pasaron todos los argumentos)
