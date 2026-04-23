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

```c
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

void atbash(char *texto) {
    char alfabeto_invertido[] = "ZYXWVUTSRQPONMLKJIHGFEDCBA";
    
    for (int i = 0; i < strlen(texto); i++) {
        if (isalpha(texto[i])) {
            texto[i] = isupper(texto[i]) ? alfabeto_invertido[texto[i] - 'A'] : alfabeto_invertido[toupper(texto[i]) - 'A'];
        }
    }
}

int main() {
    char texto[] = "c4rta";
    
    atbash(texto);
    printf("Cifrado: %s\n", texto);

    atbash(texto);
    printf("Decifrado: %s\n", texto);

    return 0;
}
```

En el codigo, se define el parametro ```*texto``` que sera el texto a cifrar y ```alfabeto_invertido``` que es un arreglo de caracteres

En el for: ```($int i = 0; i < strlen(texto); i++)```, se recorre de acuerdo al total de elementos que contiene ```texto```

Posteriormente con  ```(isalpha(texto[i]))``` se verifica si el caracter actual es una letra, si no lo es, simplemente se omite, se debe de verificar que es una letra, por que atbash solo cifra letras

Despues se verifica si el caracter actual (```isupper(texto[i])```) es mayuscula, si lo es, se ejecuta la primera parte de la condicion: ```alfabeto_invertido[texto[i] - 'A']```,  lo que hace es que al caracter actual lo convierte en su correspondiente al alfabeto invertido,  restando el valor ASCII de A con el valor ASCII del caracter actual, por lo que si es la letra A, la posicion numerica es 0, si es B, es 1, C es 2, y ese valor se selecciona de ```alfabeto_invertido```, por ejemplo, 'A' - 'A' es 0, que corresponde a Z.

Si no se cumple esta condificion, se ejecuta esta otra parte: ```alfabeto_invertido[toupper(texto[i]) - 'A']```, que hace lo mismo pero convierte el resultado en mayuscula, por que como les habia mencionado, por convecion se convierte a mayuscula.


```bash
❯❯❯ ./Atbash
Cifrado: X4IGZ
Decifrado: C4RTA
```
