---
layout: default
title: Archivos
parent: Perl
grand_parent: Programacion
---

# Archivos
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Existen 6 modos para manejar archivos

| Operacion | Descripcion                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| &lt;      | Abre el archivo en solo lectura                                              |
| &gt;      | Crea el archivo si es necesario, trunca el contenido y escribe en el         |
| >>        | Crea el archivo si es necesario y hace un append                             |
| +&lt;     | Lo abre en modo de lectura y escritura                                       |
| +&gt;     | Crea el archivo si es necesario, trunca el contenido, lo lee y escribe en el |
| +>>       | Crea el archivo si es necesario, lee y hace un append                        |

Principalmente existen dos metodos para manejar archivos ```open```y ```sysopen```

## Open
Sintaxis: ```open IDENTIFICADOR, EXPRESION```

### Abrir un archivo y leerlo

```perl
open(DATOS, "<prueba.txt") or die "No se pudo abrir el archivo";

while(my $linea = <DATOS>){
	print $linea;
}
close(DATOS);
```
Usando forearch
```perl
foreach my $linea (<DATOS>){
	print $linea;
}
```

### Escribir al final de un archivo

```perl
my $nuevo_texto = "Hola";

open(DATOS, ">>prueba.txt") or die "No se pudo abrir el archivo";

print DATOS $nuevo_texto;
close(DATOS);
```

### Truncar el contenido y escribir en el

```perl
my $nuevo_texto = "Hola2";

open(DATOS, ">prueba.txt") or die "No se pudo abrir el archivo";

print DATOS $nuevo_texto;
close(DATOS);
```

### Buscar una palabra en el archivo

 ```perl
 open(DATOS, "<prueba.txt") or die "No se pudo abrir el archivo";

while(my $linea = <DATOS>){
	if ($linea =~ /quantum/){
		print "Palabra encontrada: ";
	}
	print $linea;
}
close(DATOS);
 ```
 En este caso la palabra que queremos buscar es ```quantum```
 
**Funciones utiles**
- chomp(): Eliminar le caracter de salto de linea cuando se recorre un archivo linea por linea

## Modulo File
Es un modulo que provee diversar funciones para trabajar con archivos

### Obtener nombre del archivo

```perl
use File::Basename;

my $archivo = "prueba.txt";
print basename($archivo);
```

### Copiar un archivo

```perl
use File::Copy;
use File::Basename;

my $origen = "prueba.txt";
my $destino = "/tmp/" . basename($origen);

copy($origen, $destino);
```
En este caso se copia el archivo a /tmp con el mismo nombre