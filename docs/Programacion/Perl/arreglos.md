---
layout: default
title: Arreglos
parent: Perl
grand_parent: Programacion
---

# Arreglos
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---


Almacena valores escalares, se declaran usando el simbolo ```@```, para acceder a los elementos de un arreglo se usa ```$```
```perl
@waifus = ("Nazuna", "Exu", "Miwa");
my $elemento_1 = $waifus[0]; #se acceder a la posicion 0
```
## Iterar sobre un arreglo
---
>**Primera forma**

```perl
foreach my $elemento (@nombre){
	print "Valor: $elemento\n"
}
```
Se usa ```foreach```recorrer el arreglo, la variable ```$elemento``` tiene cada valor del arreglo
> **Segunda forma**

```perl
while (my ($indice, $elemento) = each @nombre) {
	print "Indice: $indice - Valor: $elemento\n";
}
```
La función ```each``` regresa dos elementos que son ```clave : valor```, en este caso esta devolviendo el par de ```$indice : $elemento``` del arreglo ```@nombre```, por lo que en cada iteracion, regresa el indice y su valor asociado

> **Tercera forma**

```perl
foreach (@nombre) {
	print "$_\n";
}
```
En este caso el ```$_``` es una variable predefinida que funciona como argumento en operaciones de loop, este ejemplo, en cada iteracion, cada elemento del arreglo ```@nombre``` se almacena en ```$_``` y lo va imprimiendo 

> **Cuarta forma**

```perl
while (my $elemento = shift @nombre) {
	print "$elemento\n";
}
```
Este ejemplo se usa ```shift``` para extraer el primer elemento del arreglo y luego lo descarta, por lo que, en cada iteración el valor de retorno de ```shift``` se almacena en ```$elemento```y luego lo descarta y sigue con el siguiente elemento. Asi hasta completar todo el arreglo

> **Quinta forma**

```perl
for my $elemento (0 .. $#nombre){
	print "$nombre[$elemento]\n";
}
```
En este caso se va a recorrer el arreglo desde el 0 hasta el ultimo elemento del arreglo, se usa ```#```para contar el numero total de elementos y se van a almacendo en ```$elemento```, por lo que cuando se hace el print, se usan los corchetes para indicar que se va a acceder a los elementos del arreglo

>**Sexta forma (C-style)**

```perl
for (my i = 0; i < @arreglo; i++){
	print $arreglo[$i];
}
```
## Operaciones basicas
---
Agregar elementos:
```perl
push (@arreglo, "Elemento"); #Lo agrega al final
unshift (@arreglo, "Elemento"); #Lo agrega al inicio
```
Eliminar elementos:
```perl
pop (@arreglo); #Elimina el ultimo
shift (@arreglo); #Elimina el primero
```
Tamaño del arreglo
```perl
$tam = scalar @arreglo;
```
Concaternar dos arreglos
```perl
@nuevo_arreglo = (@arreglo1, @arreglo2); 
```

## Arreglo de hashes
---
```perl
my @waifus = (
    {
		Kumiko => "Hibike Euphonium",
		Nazuna => "Yofukashi",
	},
	{
		Exusiai => "Arknights",
	}
);

foreach my $waifu_hash (@waifus) {
	foreach my $key (keys %$waifu_hash) {
		my $value = $waifu_hash->{$key};
		print "$key: $value\n";
	}
}
```
- ```$waifu_hash``` tiene una referencia a cada hash dentro del arreglo 
- ```$key``` tiene las claves de ```%$waifu_hash``` (se usa % para desreferenciarlo y volverlo un hash de nuevo)
- ```$value```tiene el valor asociado de cada ```$key``` 

```$waifu_hash->{$key}``` se declara de esta forma ya que ```$waifu_hash``` contiene las referencias a cada hash durante el bucle, se hace uso de ```->``` para acceder a los valores asociados de ```$key``` (las claves)

## Buscar en el arreglo

```perl
foreach my $waifu_hash (@waifus) {
	my @matching_keys = grep { $waifu_hash->{$_} eq "Yofukashi" } keys %$waifu_hash;
	foreach my $key (@matching_keys) {
		print "$key\n";
	}
}
```

- ```keys %$waifu_hash``` se obtienen todas las claves del hash
- ```grep { $waifu_hash->{$_} eq "Yofukashi" }``` usando ```$waifu_hash->{$_}``` se accede a cada valor de las claves de ```%$waifu_hash``` y filtrando por las que tengan ```Yofukashi``` 
	- El valor de cada clave se encuentra en ```$_```

