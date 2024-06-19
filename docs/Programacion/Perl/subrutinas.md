---
layout: default
title: Subrutinas
parent: Perl
grand_parent: Programacion
---

# Subrutinas
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Se declaran poniendo la palabra ```sub``` de la siguiente forma:
```perl
sub imprimir{
	print "Ola\n";
}
```
## Uso de argumentos

Para pasar argumento se puede hacer usando un arreglo predefinido: ```@_``` 

```perl
sub argumentos{
	my ($argumento_1, $argumento_2) = @_;
	print "$argumento_1 $argumento_2";
}
```
En este caso ```$argumento_1``` es el primer elemento del arreglo, y ```argumento_2``` es el segundo, y debido a que es un arreglo, el primer argumento de la función está en ```$_[0]```, el segundo está en ```$_[1]```, y así sucesivamente.

Si no se desea hacer tan explicita la declaración de los argumentos, se puede trabajar directamente con ```@_``` (solo aplicaria para funciones cortas o funciones anonimas)

```perl
sub argumentos{
	print $_[0] + $_[1];
}
argumentos(1, 2);
```

### Pasando un arreglo como parametro

```perl
sub arreglo{
	my (@nombre) = @_;
	for (@nombre){
		print "$_\n";
		# $res .= "$_\n"; concatena el valor de cada elemento en "res" 
	}
	#return $res;
}
my @mi_arreglo = ("uno", "dos", "tres");
arreglo(@mi_arreglo);
```

### Pasando un hash como parametro

```perl
sub print_hash {
   my (%hash) = @_;
   foreach my $clave ( keys %hash ) {
      my $valor = $hash{$clave};
      print "$key : $valor\n";
      #$res .= "$key : $value\n";
   }
   #return $res;
}

%hash = ('name' => 'Tom', 'age' => 19);
print_hash(%hash);
```

## Subrutinas anonimas

Es una funcion que se define sin asignarle un nombre especifico, tambien son conocidas como funciones lambda

```perl
my $saludo = sub {
    my ($nombre) = @_;
    return "Hola, $nombre!";
};

print $saludo->("Juan"); 
```
Se usa ```->``` ya que se debe de hacer la referencia para invocar a la funcion 

### Subrutina que retorna una funcion anonima

```perl
#!/usr/bin/env perl

sub multiplicar{
	my ($numero_1) = @_;
	return sub {
		my ($numero_2) = @_;
		return $numero_1 * $numero_2;
	}
}
my $resultado = multiplicar(2);
print $resultado->(5);
```

- La funcion ```multiplicar``` recibe como argumento ```$numero_1``` 
- La funcion ```multiplicar``` retorna una funcion anonima que recibe como argumento ```$numero_2```, esa funcion anonima retorna la multiplicación de ```$numero_1``` y ```$numero_2``` 
- La variable ```$resultado``` solo tiene la referencia la funcion anonima
- Cuando se usa ```$resultado->(5)``` se esta llamando a la funcion anonima, y entonces ```5``` es el argumento ```$numero2_``` de la función anonima

## Subrutinas con parametro opcional

La idea de poner una subrutina con un parametro opcional es indicar que si no es especifica nigun parametro, tome uno por defecto

```perl
sub opcional {
	my ($numero) = @_;
	my $default = 5;
	if ($numero eq undef){
		$numero = $default;
	}
	return $numero;
}
print opcional();
```

Se define el parametro ```$numero``` y la variable ```$default```, luego en el if se compara si ```$numero``` es indefinido (```undef```), si no tiene ningun valor, a ```$numero``` se le asigna el valor de ```$default```

## Subrutinas con subrutinas y bloques anonimos

```perl
#!/usr/bin/env perl
sub area_cuadrado {
	my ($lado_1, $lado_2) = @_;
	{
		sub calcular {
			my $operacion = $_[0] * $_[1];
			return $operacion;
		}
		return calcular($lado_1, $lado_2);
	}
}
print area_cuadrado(5, 5);
```

La funcion ```area_cuadrado``` tiene como parametro ```$lado_1``` y ```$lado_2```, dentro de ella tiene un bloque anonimo con la funcion ```calcular```, la cual tiene la variable ```$operacion``` con el resultado de multiplicar ```$_[0]```(lado_1) y ```$_[1]``` (lado_2). 

Dentro del mismo bloque anonimo se llama a la funcion ```calcular``` con los parametros de ```area_cuadrado```.
- El valor de retorno de ```area_cuadrado``` es el ultimo return
- La funcion ```calcular``` se debe de llamar dentro del mismo bloque anonimo por temas de alcance de las variables


