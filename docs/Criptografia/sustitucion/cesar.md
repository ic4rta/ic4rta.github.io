---
layout: default
title: Caesar
parent: Cifrados por sustitucion
grand_parent: Criptografia
---

# Caesar
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Definicion

El cifrado cesar es un tipo de cifrado por sustitucion el cual desplaza cada caracter del texto original una cantidad especificada, esto se le domina ```clave``` o ```desplazamiento```, historicamente se desplaza 3 posiciones, pero en realidad puede ser cualquier otra.

Por ejemplo, queremos cifrar la palabra Hola con 3 desplazamientos, el resultado quedaria asi:

H ---> K

o ---> r

l ---> o

a ---> d

Basicamente lo que se esta haciendo es contar 3 letras a partir de la letra original.

Esta operaciones se podria representar con la formula:

**En(x) = (x + n) mod 26**

- En(x): significa que se va a cifrar *x*
- n: La cantidad posiciones que se va a desplazar
- mod 26: Es una operacion de modulo que se ocupa para que no sobrepase la cantidad de letras del abecedario (se esta tomando el abecedario en ingles)

Y para decifrar podemos usar esta formula pero restando *x* - *n*

**Dn(x) = (x – n) mod 26**

## Implementacion

```c
#include <stdio.h>
#include <ctype.h>
#include <string.h>

void cifrado_cesar(char *texto, int desplazamiento) {
	for (int i = 0; i < strlen(texto); i++) {
        if (isalpha(texto[i])) {
            if (islower(texto[i])) {
                texto[i] = (((texto[i] - 'a') + desplazamiento) % 26) + 'a';
            } else {
                texto[i] = (((texto[i] - 'A') + desplazamiento) % 26) + 'A';
            }
        }
    }
}

void descifrado_cesar(char *texto, int desplazamiento) {
    for (int i = 0; i < strlen(texto); i++) {
        if (isalpha(texto[i])) {
            if (islower(texto[i])) {
                texto[i] = (((texto[i] - 'a' + 26) - desplazamiento) % 26) + 'a';
            } else {
                texto[i] = (((texto[i] - 'A' + 26) - desplazamiento) % 26) + 'A';
            }
        }
    }
}

int main() {
    char message[] = "Hola";
    int shift = 3;
    
    cifrado_cesar(message, shift);
    printf("Cifrado: %s\n", message);

    descifrado_cesar(message, shift);
    printf("Descifrado: %s\n", message);

    return 0;
}
```

En la funcion de cifrado se definen dos parametros, ```*texto``` que es al texto a cifrar y ```desplazamiento```

Posteriormente en for se recorre de acuerdo a la cantidad total de elementos de ```*texto```: ```(int i = 0; i < strlen(texto); i++)```

Despues con la funcion ```isalpha()``` se verifica si cada caracter del texto (```texto[i]```) es una letra, ya que solo estamos trabajando con letras

Despues con la funcion ```islower()``` se verifica si cada caracter es minuscula, si lo es, se hacen las operacione tomando letras minusculas, si no, letras mayusculas, es necesario esto para respetar las minusculas y mayusculas del texto original.

Por ultimo llega a la parte de cifrado: ```texto[i] = (((texto[i] - 'a') + desplazamiento) % 26) + 'a'```

- ```texto[i] - 'a'```: Aqui se convierte la letra de la posicion ```i``` en un numero del rango de 0 a 25 restandole ```a```, esto con el fin de encontrar su posicion de acuerdo al alfabeto, es decir, a -> 0, b -> 1, c -> 2, y asi sucesivamente, en esta operacion, se resta los valores ASCII de ```texto[i]``` y ```a```

- ```+ desplazamiento) % 26) + 'a'```: Al numero obtenido anteriormente se le suma el desplazamiento y se le aplica *mod 26* para que el resultado este en el rango del abecedario, y se le suma ```a``` para convertirla nuevamente a letra 


Haciendo las operaciones manualmente serian asi para cifrar la letra ```h```

1. Obtenemos el valor numerico a h: **'h' - 'a' = 104 - 97 = 7**
2. Se aplica el desplazamiento: **7 + 3 = 10**
3. Se aplica el modulo: **10 *mod 26* = 10**
4. Se convierte a letra: **10 + 'a' = 10 + 97 = 107 = k**

La letra cifrada es ```k```

Eso es por si la letra es minuscula, para mayusculas es lo mismo pero ahora es 'A', y en la parte del cifrado funciona igual pero ahora restamos el desplazamiento.

Cifrado ```Hola``` con 3 desplazamientos

```bash
❯❯❯ ./cesar
Cifrado: Krod
Descifrado: Hola
```