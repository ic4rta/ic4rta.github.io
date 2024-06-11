---
layout: default
title: Atbash
parent: Cifrados por sustitucion
grand_parent: Criptografia
---

# Atbash
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Definicion

Atbash en un metodo de "cifrado" por sustitucion que originalmente utilizaba el alfebeto hebreo. Su funcionamiento se basa en realizar una sustitucion de la primera letra del abecedario por la ultima, como por ejemplo: A -> Z, B -> Y, C -> X, y asi sucesivamente.

Como leyeron al principio, puse la palabra cifrado entre comillas, ya que Atbash no utiliza como tal algun tipo de clave  ```K```  para hacer el "cifrado". 

- En Atbash solo se usa para cifrar letras
- Por ajuste, el texto cifrado lo convierte a mayusculas (no es necesario ni afecta su funcionamiento)

## Implementacion

```ruby
sub atbash {
    my ($texto) = @_;
    my $texto_cifrado = "";
    my @alfabeto = ('A'..'Z');
    my @alfabeto_invertido = reverse @alfabeto;

    foreach my $letra (split //, uc($texto)) {
        if ($letra =~ /[A-Z]/) {
            my $posicion = ord($letra) - ord('A');
            $texto_cifrado .= $alfabeto_invertido[$posicion];
        } else {
            $texto_cifrado .= $letra;
        }
    }
    return $texto_cifrado;
}

my $texto = atbash("c4rta");
print $texto;

my $texto_decifrado = atbash($texto);
print "\n$texto_decifrado";
```

En el codigo, se define el parametro ```$texto``` que sera el texto a cifrar, ```$texto_cifrado``` contiene el texto cifrado, ```@alfabeto``` y ```@alfabeto_invertido``` son dos arreglos que tienen el alfabeto.

En el foreach: ```$letra (split //, uc($texto))```, ```$letra``` contiene cada valor (letra) de ```$txeto```, ademas se hace uso de ```split``` y ```uc``` para dividir el texto en caracteres individuales y pasarlos a mayuscula

Posteriormente se calcula la posicion numerica de cada letra: ```my $posicion = ord($letra) - ord('A');```, la funcion ```ord()``` devuelve el valor numerico de cada letra de acuerdo a ASCII, por lo que ```A -> 65```, despues se resta al valor de ```ord('A')``` (65), por lo que si es la letra A, la posicion numerica es 0, si es B, es 1, C es 2.

Por ultimo se cifra el texto: ```$texto_cifrado .= $alfabeto_invertido[$posicion];```, recordemos de ```$alfabeto_invertido``` es un arreglo, por lo que al indicarle ```[$posicion]```, estamos representando un indice dentro de la lista para seleccionar la nueva letra cifrada correspondiente a la letra original, asi mismo se usa ```.=``` para ir concatenando las letras.

Para decifrar el texto simplemente se llama a la funcion pero con el texto cifrado. Si ejecutamos el script podremos ver la salida cifrada y decifrada.

```bash
❯❯❯ perl Atbash.pl
X4IGZ
C4RTA⏎ 
```
