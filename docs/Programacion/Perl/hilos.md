---
layout: default
title: Hilos
parent: Perl
grand_parent: Programacion
---

# Hilos
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Para usar hilos es importa el modulo ```use threads;```
## Crear hilos
Los hilos se crean usando el metodo ```create(&sub)``` el cual como parametro recibe una referencia a una subrutina, ya que en perl los hilos ejecutan subrutinas, tambien es importante que si la subrutina recibe parametros, tambien hay que indicarlos en la creacion del hilo, tambien es comun usar el metodo ```join()``` para esperar a que un hilo termine

### Crear un unico hilo

En este ejemplo se crea un unico hilo para ejecutar la subrutina ```imprimir``` con un parametro ```id```

```perl
use threads;

sub imprimir {
    my $id = shift;
    print "Hilo $id iniciado\n";
    sleep(1);
    print "Hilo $id terminado\n";
}

my $hilo_1 = threads->create(\&imprimir, 1);
$hilo_1->join();
```

### Ejecutar una subrutina con varios hilos

```perl
use threads;

sub imprimir {
    my $id = shift;
    print "Hilo $id iniciado\n";
    sleep(1);
    print "Hilo $id terminado\n";
}

my $hilo_1 = threads->create(\&imprimir, 1);
my $hilo_2 = threads->create(\&imprimir, 2);

$hilo_1->join();
$hilo_2->join();
```

### Subrutina anonima con hilos

Hacerlo de esta forma nos ahorra el hecho de declarar la funcion en otra parte del codigo, sin embargo, la subrutina solo puede ser llamada por el hilo que la creo, no por otros
```perl
use threads;

my $hilo = threads->create(sub {
    my $id = shift;
    print "Hilo $id iniciado\n";
    sleep(1);
    print "Hilo $id terminado\n";
}, 1);

$hilo->join();
```

### Leer varios archivos

Imagina que quieres leer varios archivos para buscar una cadena pero no sabes en cual esta, pues puedes crear varios hilos para que cada uno lea un archivo

En este caso se busca la cadena ```Nazuna``` y muestra en que archivo se encuentra
```perl
use threads;

sub procesar_archivo {
    my ($archivo, $id_hilo) = @_;
    open(ARCHIVO, "<", $archivo) or die "No se pudo abrir $archivo";

    while (my $linea = <ARCHIVO>){
    	if ($linea =~ /Nazuna/){
    		print "El hilo $id_hilo encontro la cadena en $archivo";
    	}
    }
    close(ARCHIVO);
}

sub main {
    my $archivo_1 = "/tmp/archivo-1.txt";
    my $archivo_2 = "/tmp/archivo-2.txt";

    my $hilo_1 = threads->create(\&procesar_archivo, $archivo_1, 1); 
    my $hilo_2 = threads->create(\&procesar_archivo, $archivo_2, 2); 

    $hilo_1->join();
    $hilo_2->join();
}

main();
```

## threads::shared
Imagina que quieres compartir informacion entre los hilos, como lo puede ser una variable, esto puede servir para que ambos hilos consuman el mismo recurso, sin embargo, hay que tomar en cuenta la sincronizacion para evitar condiciones de carrera, perl provee la funcion ```lock()```el cual toma como parametro lo que se esta compartiendo entre los hilos, como una variable, y la bloquea, para que ningun otro hilo pueda consumir esa variable, es importante mencionar que la variable solo se puedes desbloquear por el hilo que la bloqueo, y el desbloqueo ocurre automaticamente cuando el hilo sale del bloque que contiene el llamado a ```lock()```

En este codigo se esta compartido la variable ```$total```, el cual contiene el resultado de multiplicar ```$resultado``` * 2, donde cada hilo realiza esa accion. Tambien se hizo uso se un bloque anonimo ```{ }```donde dentro de el se encuentra ```lock($total)``` el cual bloque la variable ```$local``` para que solo el hilo que la esta usando la pueda usar

```perl
use threads;
use threads::shared;

# variable compartida para almacenar el total de la multiplicacion
my $total :shared = 0;

sub calc {
    my $resultado = 1;
    while (1) {
        $resultado *= 2;
        {
            lock($total);
            $total += $resultado;
        }
        last if $resultado >= 100000;  # condición de salida arbitraria
    }
}

my $hilo_1 = threads->create(\&calc);
my $hilo_2 = threads->create(\&calc);
my $hilo_3 = threads->create(\&calc);

$hilo_1->join();
$hilo_2->join();
$hilo_3->join();

print "Total = $total\n";
```

### Escribir en archivo con varios hilos

A veces puede ser útil que varios archivos escriban en uno solo, por ejemplo, tienes varios servicios, Nginx, Kerberos, mysqld, Postfix-dovecot, y quieres que cuando en un log de tal servicio ocurra algo, ese algo lo puedes mandar al archivo compartido. Por ejemplo, quieres que cuando cualquier servicio no se pueda iniciar, lo escriba en el archivo compartido, para ellos, puedes tener un hilo por cada servicio. Para el ejemplo, vamos hacer que 3 hilos escriban en un mismo archivo

```perl
use threads;
use threads::shared;

my $archivo = '/tmp/archivo-2.txt';
my $archivo_lock :shared;

sub escribir_archivo {
	my ($datos) = @_;
	{
		lock($archivo_lock);
		open(ARCHIVO, ">>", $archivo) or die "No se puede abrir el archivo";
		print ARCHIVO $datos;
		close(ARCHIVO);		
	}
}

sub main {
	my $hilo_1 = threads->create(sub {
		escribir_archivo("Hilo 1 escribio\n");
	});

	my $hilo_2 = threads->create(sub {
		escribir_archivo("Hilo 2 escribio\n");
	});

	my $hilo_3 = threads->create(sub {
		escribir_archivo("Hilo 3 escribio\n");
	});

	$hilo_1->join();
	$hilo_2->join();
	$hilo_3->join();
}

main()
```

## Optimizar la creacion de hilos
En todos los ejemplos anteriores se creaba una variable por cada hilo y luego le hacia el join, podemos optimizar eso haciendo uso de un for para la creacion de los hilos y el join(), para ejemplificar, se modificara el ejemplo anterior


Se creo un arreglo de hilos para almacenar todos los hilos, el forearch se recorre 3 veces, donde en cada iteracion se agrega un nuevo elemento (hilo) al arreglo hilos adema de ejecutar la funcion de escribir_archivo indicando el numero del hilo (que sera la posicion del arreglo)
```perl
use threads;
use threads::shared;

my $archivo = '/tmp/archivo-2.txt';
my $archivo_lock :shared;

sub escribir_archivo {
	my ($datos) = @_;
	{
		lock($archivo_lock);
		open(ARCHIVO, ">>", $archivo) or die "No se puede abrir el archivo";
		print ARCHIVO $datos;
		close(ARCHIVO);		
	}
}

sub main {

	my @hilos; #se crea un arreglo para guardar los hilos

	foreach my $numero_hilo (1..3){
		push @hilos, threads->create(sub {
			escribir_archivo("Hilo $numero_hilo escribio\n");
		});
	}

	foreach my $hilo (@hilos){
		$hilo->join();
	}
}

main()
```

Ahora modificaremos el primer ejemplos donde usamos ```threads::shared```

```perl
use threads;
use threads::shared;

my $total :shared = 0;

sub calc {
    my $resultado = 1;
    while (1) {
        $resultado *= 2;
        {
            lock($total);
            $total += $resultado;
        }
        last if $resultado >= 100000;  # Condición de salida arbitraria
    }
}

foreach my $numero_hilo (1..3) {
    threads->create(\&calc);
}

foreach my $thread (threads->list()) {
    $thread->join();
}

print "Total = $total\n";
```