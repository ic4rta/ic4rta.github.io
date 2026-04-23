---
layout: default
title: Hashes
parent: Perl
grand_parent: Programacion
---

# Hashes
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Estructura de datos que es un conjunto pares ```clave:valor```. Los hashes se declaran con el simbolo ```%```.
```perl
%hash = (
	"clave_1" => 1,
	"clave_2" => 2,
	"clave_3" => 3
);
```
Para hacer referencia a un valor de un hash, se hace de ```$```
```perl
$hash{"clave_1"};
```
La salida del codigo es el valor ```1```

## Iterar sobre un hash

> **Primera forma**

```perl
#!/usr/bin/env perl

%hash = (
	"clave_1" => 1,
	"clave_2" => 2,
	"clave_3" => 3
);

foreach my $clave (keys %hash){
	print "Clave: $clave - Valor: $hash{$clave}\n";
}
```
Se usa la palabra ```keys``` para obtener todas las claves del hash (clave_1, clave_2...)
Se declara de esta forma ```$hash{$clave}```para acceder a los valores asociados de cada clave (```$clave```)
- Se usa ```$```en ```hash``` para acceder al valor de cada ```clave```

>**Segunda forma**

```perl
while (my ($clave, $valor ) = each %hash){
	print "Clave: $clave - Valor: $valor\n";
}
```

>**Tercera forma**

```perl
print map ("$_ = $hash{$_}\n", keys %hash);
```
La funcion ```map()```evalua la expresion para cada elemento de un arreglo o hash, en este caso la expresion es ```"$_ = $hash{$_}\n"```, se explica de esta forma
- ```$_``` Representa cada clave del hash
- ```$hash{$_}``` Representa el valor asociado a la clave del punto anterior (```$_```)

## Ordenar un hash
---
En Perl los hashes son almacenados de acuerdo a la ubicacion de memoria, por lo que cuando se imprimen salen aleatorios, esto con el objetivo de prevenir ataques de complejidad algoritmica

Para ordenar hashes de acuerdo a su clave solo es necesario ingresar la palabra ```sort``` 

```perl
foreach my $clave (sort(keys %hash)){
	print "Clave: $clave - Valor: $hash{$clave}\n";
}
```

## Hash de hashes
---
```perl
my %waifus = (
	"Arknights" => {
		"Exusiai" => 1,
		"Texas" => 2,
		"Lappland" => 3,
	},
	"Genshin" => {
		"Hu Tao" => 4,
		"Layla" => 5,
		"Faruzan" => 6,
	},
);  

foreach my $clave (keys %waifus){
	print "$clave\n";
	foreach $clave_subhash (keys %{$waifus{$clave}}){
		my $valor = $waifus{$clave}->{$clave_subhash};
		print "\t$clave_subhash: $valor\n";
	}
}
```
- ```$clave``` tiene la clave a cada hash dentro del hash ```%waifus``` (Arknights y Genshin)
- ```%{$waifus{$clave}}``` accede a las claves asociadas en ```$clave``` (se usa ```%``` para desreferenciarlo y volverlo un hash de nuevo), esas claves las almacena en ```$clave_subhash```
- ```$waifus{$clave}->{$clave_subhash}``` accede al valor asociado en ```$clave_subhash```
