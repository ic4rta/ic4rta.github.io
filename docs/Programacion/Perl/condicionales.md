---
layout: default
title: Condicionales
parent: Perl
grand_parent: Programacion
---

# Condcionales
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Ternary

Uso de ```?``` para condicionales inline
```
(condición) ? expresión_si_verdadero : expresión_si_falso;
```

```perl
my $numero = 10;
my $res = ( $numero > 5 ) ? "El numero es mayor" : "El numero es menor";
print $res;
```
En este caso se asigna uno de los valores "El numero es mayor" o "El numero es menor" a la variable ```res```,  dependiendo de la condición

Ejemplo usando return en una funcion
```perl
sub saludar {
    my $es_amigo = shift;
    return ($es_amigo) ? "Hola, amigo!" : "Hola, desconocido!";
}

print saludar(1), "\n";  # Imprime "Hola, amigo!"
print saludar(0), "\n";  # Imprime "Hola, desconocido!"


sub obtener_puntaje {
    my $puntaje = shift;
    return ($puntaje >= 60) ? "Aprobado" : "Reprobado";
}

print obtener_puntaje(75);  # Imprime "Aprobado"
```

Ejemplos para saber si un numero es par o impar en un arrreglo
```perl
my @numeros = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

foreach my $numero (@numeros) {
    print "$numero " . (($numero % 2 == 0) ? "es par" : "es impar") . "\n";
}
```
Se tiene que usar el **.** por que el resultado de evaluar la expresion se concatena al valor de ```numero``` 

## unless

Si la condicion es falsa, el codigo se ejecuta

```perl
my $numero = 10;
unless ($numero < 5){
	print "El numero es menor a 5";
}
```
