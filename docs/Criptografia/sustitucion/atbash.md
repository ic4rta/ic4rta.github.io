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
def atbash(texto)
  texto_cifrado = ""
  alfabeto = ('A'..'Z').to_a
  alfabeto_invertido = alfabeto.reverse

  texto.upcase.each_char do |letra|
    if alfabeto.include?(letra)
      posicion = letra.ord - 'A'.ord
      texto_cifrado += alfabeto_invertido[posicion]
    else
      texto_cifrado += letra
    end
  end
  texto_cifrado
end

texto = atbash("c4rta")
puts texto

texto_decifrado = atbash(texto)
puts texto_decifrado
```

En el codigo, se define el parametro ```texto``` que sera el texto a cifrar, ```texto_cifrado``` contiene el texto cifrado, ```alfabeto``` y ```alfabeto_invertido``` son dos arreglos que tienen el alfabeto.

En el loop: ```texto.upcase.each_char```, ```letra``` contiene cada valor (letra) de ```texto```

Posteriormente se calcula la posicion numerica de cada letra: ```posicion = letra.ord - 'A'.ord```, el metodo ```ord``` devuelve el valor numerico de cada letra de acuerdo a ASCII, por lo que ```A -> 65```, despues se resta al valor de ```'A'.ord``` (65), por lo que si es la letra A, la posicion numerica es 0, si es B, es 1, C es 2.

Por ultimo se cifra el texto: ```texto_cifrado += alfabeto_invertido[posicion]```, recordemos de ```alfabeto_invertido``` es un arreglo, por lo que al indicarle ```[posicion]```, estamos representando un indice dentro del arreglo para seleccionar la nueva letra cifrada correspondiente a la letra original, asi mismo se usa ```+=``` para ir concatenando las letras.

Para decifrar el texto simplemente se llama a la funcion pero con el texto cifrado. Si ejecutamos el script podremos ver la salida cifrada y decifrada.

```bash
❯❯❯ ruby Atbash.rb
X4IGZ
C4RTA⏎ 
```
