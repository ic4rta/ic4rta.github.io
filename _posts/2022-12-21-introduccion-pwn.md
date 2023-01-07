---
layout: single
title: Introduccion a la explotacion binaria
excerpt: "Esta vez te enseñare la parte teorica de lo que considero debes de saber para empezar en el pwn"
date: 2022-12-21
classes: wide
header:
  #teaser: /assets/images/introduccion/waifu.jpg
  teaser_home_page: true
  #icon: /assets/images/hackthebox.webp
categories:
  - Explotacion binaria
  #- infosec
---

Creo que debi de hacer este post antes de los demas pero pues se me olvido jiji, asi que ahora te voy a dar una pequeña introduccion sobre algunos temas que considero, son relevantes para iniciar en la explotacion binaria, o mas que nada antes de explotar tu primer buffer overflow stack based, lo que voy abordar es lo siguiente:

1. Estructura de un binario ELF
    - 1.1. ¿Que es ELF?
    - 1.2. Encabezado del ELF
    - 1.3. Tabla de encabezado de un programa
    - 1.4. Seccion .text
    - 1.5. Seccion .data
    - 1.6. Seccion .rodata
    - 1.7. Seccion .bss
    - 1.8. Ejemplo

2. Stack de un programa en C
    - 2.1. Stack
    - 2.2. Stack frame
    - 2.3. Ejemplo

3. Lenguaje ensamblador
    - 3.1. Organizacion y arquitectura
    - 3.2. Un poco de historia de x86
    - 3.3. x86 y x86_64 ISA 
    - 3.4. Sintaxis AT&T e Intel
    - 3.5. Tipos de datos
    - 3.6. Instrucciones aritméticas y lógicas
    - 3.7. Instrucciones de flujo de datos 
    - 3.8. Instrucciones de flujo de control

Asi que es hora de comenzar la aventura!! ^^

---

## 1. Estructura de un binario ELF

### 1.1 ¿Que es ELF?

Las siglas en español significan "Formato ejetutable enlazado". Este es un tipo de formato de archivos ejecutables, archivo de objeto/archivo reubicable u objeto compartido, la mayoria de los sistemas *NIX usan este formato de archivo binario, por mencionar algunos ejemplos pueden ser:

- **Archivo ejecutable**: Imagina un archivo ejecutable cualquiera, por ejemplo, el ejecutable de un programa en C, este puede ser ejecutado por el sistema operativo. Se genera mediante la vinculacion de uno o mas archivos de objetos los cuales podrian estar usando Dynamic linking para acceder a las funciones de otros archivos de objetos compartidos, y este archivo contiene el punto de entrada del programa

- **Objeto/archivo reubicable**: Este contiene el codigo maquina equivalente a un archivo fuente en C, pero aun no se ha vinculado para generar el ejecutable

- **Bibliotecas compartidas**: Tambien se les conoce como archivo de "objeto vinculado dinamicamente", esto es por que contiene codigo maquina que se reubica dinamicamente y se ejecuta

### 1.2 Encabezado del ELF

![](/assets/images/introduccion/elf.png)

Esta mega imagen (fue la primera que salio en google jeje), es la estructura basica de un archivo ELF.

Primeramente tenemos le encabezado ELF (ELF header), esta esta presente en todos los archivos ELF, comienza desde el byte 0 hasta el 32, es decir que tiene una longitud de 32 bytes (si hablamos de una arquitectura x64 entonces tiene una longitud de 64 bytes), y mas que nada el ELF header describe la organizacion del archivo, asi como identifica el formato del archivo. Y te lo voy a demostrar ^^

Abre tu terminal e ingresa este comando ```readelf -h /usr/bin/whoami```, esto nos servira para mostrar el encabezado ELF del binario "whoami" y te debio de dar algo como esto:

```
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x2240
  Start of program headers:          64 (bytes into file)
  Start of section headers:          29104 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         13
  Size of section headers:           64 (bytes)
  Number of section headers:         26
  Section header string table index: 25
```

### Numero Magico (Magic) - primeros 4 bytes

La magia de los ELF... En nuestro ejemplo podemos ver una linea como esta
```
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00
```
Este numero magico que esta en hexadecimal, son los primeros 4 bytes que corresponden a ```0x7f, E, L, F```. ¿Y por que?, por que es la traduccion de ELF del hexadecimal

```
E = 45
L = 4c
F = 46 
```
El ```7f``` simplemente es un prefijo. Entonces podemos decir que el numero magico (Magic) son esos valores identifica el formato ELF de un binario.

### Clase - Byte 5

El byte numero 5, este especifica la clase del binario, osea si el binario ELF es de 32 bits o de 64 bits, en mi ejemplo sale algo como esto

```
Class:                             ELF64
```

Asi que el binario es de 64 bits :)

**A tomar en cuenta**

- Si no es de 32 bits o de 64 bits entonces mostrara algo como ```ELFCLASSNONE```

- Los binarios de 32 bits utilizan registros de 32 bits y los binarios de 64 bits utilizan registros de 64 bits

- En una compu de 64 bits, se puede ejecutar un binario de 32 bits porque un sistema operativo de 64 bits está hecho para emular un procesador de 32 bits usando el procesador subyacente de 64 bits cuando se ejecuta un binario de 32 bits. Pero el reves no se puede

### Codificacion de datos o Data - Bytes 6

Existen dos formas de codificar datos, en little endian y big endian, basicamente es la forma en la que se ordenan los bytes en la memoria (esto es un tema mas extenso asi que te recomiento buscar por tu cuenta acerca de "Endianess" :heartbeat: ), en nuestro ejemplo sale algo como

```
Data:                              2's complement, little endian
```
Y nos dice que nuestro binario usa little endian, entonces podemos decir que "Data" se refiere a la manera en la que estan codificados los datos

### Version ELF - byte 7

Se refiere al numero de version... Y pues solo existe ```01```, solo hay una version y es esa, nada importante la verdad jajaj

### ABI

Aplicacion de interfaz binaria (ABI), estas son reglas que son seguidas por el compilador y enlazador el generar el ejecutable, como por ejemplo: la convencion de llamadas a funciones en los binarios de intel de 32 y 64 bits es diferente, eso quiere decir que estan usando diferentes ABI. En nuestro ejemplo sale algo como esto

```
OS/ABI:                            UNIX - System V
```

Y vemos que el sistema operativo es UNIX, entonces podemos decir que ABI, es la codificacion del sistema operativo y la ABI usada para contruir este ejecutable

### 1.3. Tabla de encabezado de un programa

Antes que anda hay que ver por que se llama "Tabla de encabezados de un programa".
Cada encabezado de un programa describe un segmento dentro de el, y cada segmento es una pieza importante del programa. Para mostrar los segmentos de un binario ingresa el comando ```readelf -l /usr/bin/whoami```

Vemos como nos dice que hay 13 encabezados del programa. Quiero destacar 2 cosas, donde dice "Flags" y "Aling".

Aling almacena un valor de como se alinean los segmentos en la memoria de un binario en tiempo de ejecucion

Y las flags, que se refieren a los permisos del segmento, aca te dejo una lista de cada uno (Referencia por Oracle)

![](/assets/images/introduccion/flags.png)

Y el significado de cada tipo de encabezado que muestra nuestro ejemplo, es:

- **PH_PHDR**: Especifica la ubicacion y tamaño de la tabla de cabeceras del programa, ese encabezado es unico, es decir que no puede ocurrir dos veces en un mismo programa

- **PT_INTERP**: Especifica un segmento que es cargable, es decir que los bytes de el archivo se asignan al principio del segmento de memoria

- **PT_DYNAMIC**: Especifica la informacion del enlace dinamico (otro tema bastante extenso, te recomiendo buscar en google "dynamic linking elf")

- **PT_NOTE**: Especifica la ubicacion y tamaño de la informacion extra del binario, alguna de esta informacion es creada por el mismo programador

- **GNU_EH_FRAME**: Se refiera a una zona usada por gcc, la cual almacena controladores de excepciones, asi que cuando algo sale mal, puede usar esta area para tratarlo

- **GNU_STACK**: Se usa para almacenar informacion acerca de la pila o stack (ya veremos esto mas adelante)

### 1.4. Seccion .text

Contiene el codigo del ejecutable, este empaquetara en un segmento con permisos de luctura y escritura. Solo se hace una vez ya que el contenido no cambiara

### 1.5. Seccion .data

Esta seccion contiene variables inicializadas globalmente (nada mas que agregar jeje)

### 1.6. Seccion .rodata

Lo mismo que .data pero los datos solo tienen permisos de solo lectura

### 1.7 Seccion .bss

Esta contiene todas las variables globales no inicializadas. 

**Dato extra**

Segun lo que he leido y hasta donde se, BSS se conoce como "Better save space", y esto es por que en el archivo de objeto, el nombre y tamaño de una variable no se le da memoria real hasta que se usan.

### 1.8 Ejemplo

Todo esto visto es la teoria, y los elf header como te los mostre con el comando readelf, es la manera bonita de verlos, realmente no se ven asi, y al menos en el analisis de malware los tendras que ver en hexadecimal, para verlos asi, usaremos el comando:

```hexdump -C /usr/bin/whoami | head -n 10```
Esto mostrara el encabezado elf en hexadecimal, ahora te indicare donde se encuentran los elementos mas relevante del encabezado

![](/assets/images/introduccion/elf_header.png)
![](/assets/images/introduccion/elf_struct.png)

- e_ident: Marca el archivo como un archivo de objeto y proporciona datos independientes de la máquina para decodificar e interpretar el contenido del archivo, ademas es el Magic

- e_type: Identifica el tipo de archivo de objeto

- e_machine: Especifica la arquitectura necesaria para un archivo individual

- e_version: Identifica la versión del archivo

- e_entry: Dirección virtual en la que se iniciará el programa. Un valor de 0 indica que no hay ningún punto de entrada

- e_shoff: Desplazamiento del archivo de tabla de encabezado de sección en bytes

## 2. Stack de un programa en C

### 2.1 Stack

El stack o pila en español, es una estructura de datos y un area de la memoria de un programa en C, donde se almacenan valores de registros de manera temporal, variables locales, parametros de funciones y direccion de retorno

Los limites de la pila de registran mediante los registros EBP y ESP

- EBP: Puntero base, y apunta al fondo de la pila
- ESP: Puntero de la pila, y apunta a la parte superior de la pila

### 2.2 Stack frame

El stack frame o marco de la pila, es una parte del stack que esta dedicada a una funcion, esta almacena los parametros de una funcion, un puntero de retroceso al stack frame anterior y las variables locales, por ejemplo, tenemos este codigo en C

```c
int func_1(int a, int b){
  int res = a + b;
  return res;
}

int func_2(int a, int b){
  int res = a + b;
  return res;
}

int main(int argc, char *argv[]){
  int resultado;
  resultado = func_1(2, 2);
}
```
Nuestros stack frame quedan asi

```
|------------------------|
|  stack frame de main   |
|------------------------|
|  stack frame de func_1 |
|------------------------|
|  stack frame de func_2 |
|------------------------|
```
A tomar en cuenta:
- El stack en un programa en C crece hacia abajo, es decir hacia las direccion de memoria mas bajas.

- La direccion que se almacena en ESP cambian constantemente a medida que los elementos del stack entran o salen, asi que siempre apunta al ultimo elemento

- El EBP apunta a una ubicacion fija dentro del stack frame de la funcion que se este ejecutando actualmente, y este sirve como punto de referencia para acceder a argumentos y variables locales

### 2.3 Ejemplo

Para que quede un poquito mas claro, tenemos este codigo:

```c
int main(){
    int a = 5;
    int b = a + 6;
    return 0;
}
```
Esto pasandolo por GDB (GNU debugger), queda algo como esto

```
Dump of assembler code for function main:
0x0000000100000f50 <main+0>:    push   %rbp
0x0000000100000f51 <main+1>:    mov    %rsp,%rbp
0x0000000100000f54 <main+4>:    mov    $0x0,%eax
0x0000000100000f59 <main+9>:    movl   $0x0,-0x4(%rbp)
0x0000000100000f60 <main+16>:   movl   $0x5,-0x8(%rbp)
0x0000000100000f67 <main+23>:   mov    -0x8(%rbp),%ecx
0x0000000100000f6a <main+26>:   add    $0x6,%ecx
0x0000000100000f70 <main+32>:   mov    %ecx,-0xc(%rbp)
0x0000000100000f73 <main+35>:   pop    %rbp
0x0000000100000f74 <main+36>:   retq
```

El ```disassemble```, es comando predeterminado y muestra instrucciones en la sintaxis de AT&T, que es la misma sintaxis utilizada por el ensamblador GNU. Las instrucciones en la sintaxis de AT&T tienen el formato mnemonic orgien, destino. El mnemotécnico es un nombre legible por humanos para la instrucción. El origen y el destino son operandos y pueden ser valores inmediatos, registros, direcciones de memoria o etiquetas. Los valores inmediatos son constantes y están precedidos por un $. Por ejemplo, $0x5 representa el número 5 en hexadecimal. Los nombres de registro van con un %.

Lo primero que tenemos en el codigo es esto:

```
0x0000000100000f50 <main+0>:    push   %rbp
0x0000000100000f51 <main+1>:    mov    %rsp,%rbp
```
Estas primeras dos lineas de cualquier funcion se llaman prologo o preambulo, lo que hace la primera linea es establecer el %rbp es nuestro stack frame actual y no el de la funcion anterior, asi que se guarda el anterior en el stack y no en el stack frame de esta funcion. En la linea que sigue se copia el valor del puntero de la pila, al puntero base. Y con esto logramos que el %rbp apunte a la base del stack frame de la funcion main.


Despues tenemos esto:
```
0x0000000100000f54 <main+4>:    mov    $0x0,%eax
```
Que como dice la convencion de llamadas de x86, el valor de retorno de una funcion se almacena en %eax, por lo que la intruccion se prepara para devolver 0 al final de la funcion

Despues tenemos algo como esto:
```
0x0000000100000f59 <main+9>:    movl   $0x0,-0x4(%rbp)
```
Los parentesis significan que se trata de una direccion de memoria. Aqui, %rbo se llama el registro base, y -0x4 es el desplazamiento. Esto es equivalente a %rbp + -0x4.

Esto es por que la pila crece hacia abajo y restar 4 de la base del stack frame actual nos lleva el stack frame actual, que es donde se almacenan las variables locales, ya que se puede acceder a las variables locales haciendo referencia del %ebp

(se que esta es una parte donde que cuesta entender, asi que te dejo unos recursos bastante buenos)

- [https://courses.engr.illinois.edu/cs225/fa2022/resources/stack-heap/](https://courses.engr.illinois.edu/cs225/fa2022/resources/stack-heap/)

- [https://hackthedeveloper.com/memory-layout-c-program/](https://hackthedeveloper.com/memory-layout-c-program/)

- [https://www.recurse.com/blog/7-understanding-c-by-learningassembly](https://www.recurse.com/blog/7-understanding-c-by-learningassembly)

## 3. Lenguaje ensamblador

### 3.1 Organizacion y arquitectura

**Arquitectura**: Es la interfaz de hardware-software para ayudar a los desarrolladores a programar el hardware/procesador, es la forma en la que se puede abordar la memoria, los tipos de datos, etc

**Organizacion**: Esta basicamente es como se implementa una instruccion en particular o una tecnica de direccionamiento a nivel de hardware

- La arquitectura se trata de decirle al programador sobre la presencia de una instruccion como por ejemplo "MOV". Pero la organizacion se ocupa del diseño del hardware interno utilizado para diseñar esa intruccion 

- En los procesadores Intel y AMD, la arquitectura es la misma, lo que significa que las instrucciones son las mismas, pero a nivel de Hardware, puede haber diferencias.

### 3.2 Un poco de historia de x86

(Realmente esta parte es irrelevante para la explotacion binaria pero pues se me hace interesante mencionarla asi que si quieres leerla esta bien :heartbeat: )

Esto se remonta a cuando Intel lanza uno de los primeros procesadores de Intel, era el intel 4004, era un procesador de 4 bits. A lo largo de los años saca el procesador intel 8080, un procesador de 8 bits, este para su epoca ya era una cosa maravillosa, funcionaba con un frecuencia de reloj de 2 MHz, tenia un bus de direccion de 16 bits, entonces manejaba hasta 64 kb de memoria. Despues salio el increible intel 8086, el cual ya era un procesador de 16 bits, y se llamaba 8086 por que intel proporciono un conjunto de intrucciones para usar un microprocesador de 16 bits (El 6 de 8086 viene de el 6 de 16 bits jajaj)

El chiste es que 8086 tenia un conjunto de 16 bits. Y cuando intel introdujo los microprocesadores de 32 bits, ellos crearon un conjunto de intrucciones de 32 bits, pero en realidad era un extension del antiguo conjunto de intrucciones de 16 bits

### 3.3 x86 y x86_64 ISA

Antes que nada hay que definir que es un registro

**Registro**

Es un pequeño espacio de almacenamiento en el chip del microprocesador, y pues como esta presente en el chip, el tiempo de acceso (tiempo que tarda el procesador en leer/escribir datos almacenados en un registro en especial), es inferior

Una arquitectura x86 proporciona 8 registros con un tamaño de 32 bits o 4 bytes, estos son:

- **EAX**: Donde la a significa acumulador, y entonces es un registro que se utiliza para almacenar los resultados de algunas operaciones, como por ejemplo del valor de retorno de una funcion

- **ECX**: Donde la c significa contador, asi que generalmente se usa como contador en bucles

- **EDX**: Este es muy general, realmente se usa para almacenar todo tipo de datos

- **EBX**: Donde la b representa la base, asi que puede almacenar un valor base para una operacion en particular

- **ESI**: Registro fuente, usando para operaciones de strings

- **EDI**: Registro destino, usado para operaciones de strings

- **EBP y ESP**: estos los mencione en la parte del stack, asi que no veo necesidad de hacerlo otra vez jeje

Todos estos registro se conocen como registros de proposito general (GPR), aun que EBP y ESP si tiene un propisito, junto a estos tambien hay un registro de proposito especial que es EIP, o instruction pointer, este apunta a la siguiente direccion a ejecutar en el stack

- Cuando los procesadores de 8 bits entraron en el mercado, los nombres de los registros eran a, b, c, d

- Cuando llegaron los de 16 bits se renombraron a ax, bx, cx, dx, donde la x significa extendidos

- Cuando llegaron los de 32 bits se cambian a eax, ebx, ecx, edx, donde la x significa extendidos

- Y por ultimo cuando llegan los de 64 bits, cambian a rax, rbx, rcx, rdx, donde la r significa registro

### eflags

Las eflags son un conjunto de estados de bits, donde cada indicador tiene un valor de 0 (borrado o no establecido) o 1 (establecido). Las banderas mas importantes son:

- **zf**: La bandera de zero, se establece cunado el resultado de una operacion es cero, y de lo contrario se borra

- **cf**: La bandera de acarreo, se establece cuando el resultado de una operacion es demasiado pequeño o demasiado grande para el operador de destino

- **sf**: La bandera de signo, se establece cuando el resultado de una operacion es negativo, si es positivo se borra

La neta hay un chingo de banderas asi que si quieres ver las demas, wachate esto: [Flags](http://www.c-jump.com/CIS77/ASM/Instructions/I77_0070_eflags_bits.htm)


### Registros de segmento

Ademas de todos los registros que dije, existen los registros de segmento, estos pueden ser usados en procesadores de 32 bits y 64 bits

- cs: segmento de código, contiene la dirección inicial del segmento de código

- ds: segmento de datos, contiene la dirección inicial del segmento de datos

- ss: segmento de pila, contiene la dirección inicial del segmento de pila

- es: Segmento adicional

Tambien existen registros de segmento especiales, como lo son fs y gs, pero estos dos lo usa el sistema operativo para sus cosillas

**Cosillas extra**

- Todos los registros a excepcion del EIP/RIP y las banderas, pueden ser usados por el compilador para convertir el codigo a lenguaje ensamblador

- Estos no son los unicos registros que puede usar el procesador, estos son solo los registros visibles para el programador y compilador, algunos registros no visibles pueden ser los Registros de control que son: cr0, cr1, cr2, cr3... Estos ayudan a implementar la paginacion de la memoria a nivel de hardware. Asi que si ves uno en accion, debiste de tener mucha suerte o saberle demasiado jsjs ^^

### 3.4. Sintaxis AT&T e Intel

Hay dos sintaxis, AT&T e Intel

- **AT&T**:
  - Las intrucciones tienen formato "destino de la intruccion, origen"
  - Ejemplo: movl $2, %eax
  - Donde las constantes comienzan con $
  - Y cada registro con %

- **Intel**:

  - Esta seguramente es la vamos a ver en las practicas, y tienen el formato "destino, origen"
  - Ejemplo: mov rax, rbx, lo que significa que movera el contenido de rbx a rax

### 3.5. Tipos de datos

En ensamblador trabajaremos con bytes, los tipos de datos como char, int, long int, etc, no estan presentes a nivel de ensamblador. Asi que estos tipos de datos deben de convertirse a codigo ensamblador, esto se hace accediendo al numero especifico de bytes que representa un tipo de dato en particular en C

**Ejemplo 1**:

El tamaño de un int es de 4 bytes, y en ensamblador no tenemos eso, si no un flujo de bytes

Supongamos que ```a``` es una variable entera en C, donde su direccion se carga en rbx

Entonces si deseamos cargar ```a``` en otro registro (por ejemplo rcx), asi es como se deberia de hacer:

```mov ecx dword [rbx]```
  - mov es la intruccion
  - ecx es el regitro destino
  - dword significa ```palabra doble``` y tiene un valor de 4 bytes
  - La instruccion le dice al ensamblador que considere rbx como un puntero de palabra doble (dword). Osea, imagina que apunta a 4 bytes, entonces, cuando se usa en una instruccion, se cargan 4 bytes apuntados por rbx

  
Te dejare unos metodos que son usados para acceder a la memoria

- byte[REG] : Esto le dice al ensamblador que considere REG como un puntero de byte. Es decir, apunta a un solo byte . Cualquier operación realizada con esto como operando tomará solo 1 byte apuntado directamente por la dirección en REG.

- word[REG] : Esto le dice al ensamblador que considere REG como un puntero de palabra. Es decir, está apuntando a 2 bytes . Cualquier operación realizada con esto como operando tomará 2 bytes señalados por la dirección en REG.

- dword[REG] : 4 bytes

- qword[REG] : 8 bytes (solo para compus de 64 bits)


### 3.6. Instrucciones aritméticas y lógicas

**add**

La intruccion de suma o añadir. La sintaxis general de add es:

- add reg, reg
- add mem, reg
- add reg, mem

Ejemplo:

- add rax, rbx: agrega el valor de rax a rbx y lo almacena en rax, algo asi ```rax = rax + rbx```

- add dword[rbx], eax: agrega el valor en eax con 4 bytes en la memoria apuntada por rbx. Y el resultado tambien son 4 bytes, almacenados en el puntero de memoria por rbx

- add eax, dword ptr [rbx]: Agrega el valor en eax con 4 bytes de memoria señalados por ebx, el valor se almacena en eax

**sub**

Lo mismo que add pero ahora significa restar jajsja

**imul**

Multiplicacion de enteros, esta puede tener 2/3 operandos

- imul op1, op2 : op1 y op2 se multiplican y luego se almacenan nuevamente en op1. op1 debe ser un registro. 
- imul op1, op2, op3 : op2 y op3 se multiplican y luego se almacenan nuevamente en op1. op1 debe ser un registro y op3 debe ser un valor inmediato. 

**o, xor** Estas realizan operaciones bit a bit entre dos operandos, el par de operandos son iguales que para ```add```

**inc**

Incrementar en 1

- inc op1: Va a incrementar en 1 op1, op1 puede ser un registro o una ubicacion de memoria

**dec**

Lo mismo que ```inc``` pero ahora decrementa en 1

### 3.7. Instrucciones de flujo de datos

Abarcare 4 intrucciones: mov, lea, push y pop

**mov**: Aun que su nombre da a entender que mueve datos, en realidad los copia

Su sintaxis  es:

- mov rax, rbx: copia datos de rbx (origen) a rax (destino)

Esta instruccion tiene variaciones, que son:

  - mov reg, reg
  - mov reg, memoria
  - mov memoria, registro

Se dan cuenta que no pongo de memoria a memoria, esto es ya que solo sucede con la ayuda de un registro

- reg: puede ser un registro de proposito general

- Memoria

  - En ensamblador solo se accede a la memoria a traves de punteros. Es decir, la direccion de memoria se carga en un registro y luego se accede a el

**Nota**: para esta intruccion hay que tenemos en cuenta los tipos de datos y su tamaño en bytes

**lea**

Carga una direccion efectiva y su sintaxis es

```lea rax, rbx```
Y lo que esta haciendo es cargar la direccion de rbx a rax. Esta intruccion es similar a mov, solo que lea esta diseñada para este proposito 


**push**

Empuja algo a la pila y su sintaxis es

```push rbp```

Y nos dice que esta empujando rbp a la pila

**Nota**:
En 32 bits, la pila esta alineada a 4 bytes, esto significa que toda la memoria de la pila esta formada por fragmentos de 4 bytes. Y en 64 bits cada fragmento es de 8 bytes

**pop**

Extrae el valor de la parte superior de la pila y si sintaxis es

```pop rax```

En 32 bits puede ser cualquier registro GPR o dword de 32 bits

En 64 bits puede ser un registro de 64 bits o un espacio de memoria qword


### 3.8. Instrucciones de flujo de control

En un binario en condiciones normales, el RIP/EIP se encarga de controlar el flujo del programa, ya que estos almacenan la direccion de la siguiente instruccion a ejecutar, pero esto se ve interrumpe si hay instrucciones condicionales.

**cmp**
Compara dos operandos y si sintaxis es 
```cmp op1, op2```
Lo que hace es comprobar op1 con respecto a op2 y establece la bandera adecuada para la situacion

**jmp**

Esta es la intruccion de salto y tiene dirivados, su sintaxis es:

```jmp direccion```
La direccion puede ser un numero que represente una direccion valida, tambien puede ser una etiqueta

**Saltos condicionales**

- es - Saltar si op1 == op2
- jne - Saltar si op1 != op2
- jle - Saltar si op1 <= op2
- jge - Saltar si op1 >= op2
- jg - Saltar si op1 > op2
- jl - Saltar si op1 < op2

Todas estas intrucciones verifican las banderas establecidas por ```cmp```

**call**

Se usa para llamar a una funcion y su sintaxis es:

```call nombre_de_la_funcion```

Esta intruccion es una secuencia de otras dos intrucciones

```
push return_adress
jmp nombre_de_la_funcion
```

**ret**
Este es ejecutado por ```call``` para volver al flujo del programa normal, su usa directamente poniendo ```ret```

- ret solo se usa cuando la llamada a la funcion a terminado de ejecutarse y el return_adress es lo unico presente en el stack frame


## ¿Que sigue?

Ahora es momento de que empieces a investigar acerca de como explotar tu primer buffer overflow stack based en linux o tu primer reversing, puedes ver el post que le dedique a eso o puedes buscar por tu cuenta, tambien te recomiendo reforzar los temas con practicas e investigaciones propias

## Referencias

- [https://man7.org/linux/man-pages/man5/elf.5.html](https://man7.org/linux/man-pages/man5/elf.5.html)
- [https://docs.oracle.com/cd/E19620-01/805-4694/6j4enatcr/index.html](https://docs.oracle.com/cd/E19620-01/805-4694/6j4enatcr/index.html)
- [https://en.wikipedia.org/wiki/Executable_and_Linkable_Format](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)
- [http://blog.k3170makan.com/2018/09/introduction-to-elf-format-elf-header.html](http://blog.k3170makan.com/2018/09/introduction-to-elf-format-elf-header.html)
- [http://www.c-jump.com/CIS77/ASM/Assembly/lecture.html](http://www.c-jump.com/CIS77/ASM/Assembly/lecture.html)
- [https://www.intel.com/content/dam/develop/external/us/en/documents/introduction-to-x64-assembly-181178.pdf](https://www.intel.com/content/dam/develop/external/us/en/documents/introduction-to-x64-assembly-181178.pdf)
- [https://guyinatuxedo.github.io/](https://guyinatuxedo.github.io/)
- LiveOverflow (Youtube)
- PinkDraconian (Youtube)

Eso ha sido todo, gracias por leer ❤

![](/assets/images/introduccion/waifu.jpg)