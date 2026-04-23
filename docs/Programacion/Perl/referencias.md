---
layout: default
title: Referencias
parent: Perl
grand_parent: Programacion
---

# Referencias
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Una referencia es un tipo de dato escalar que contiene la ubicacion en memoria de otro valor que puede ser de cualquier otro tipo
```perl
$hash_ref = {
   'Exusiai'  => 'Te quiero mucho',
   'Kumiko' => 'Te quiero mucho',
};
```
En este caso se esta creando una referencia a un hash, como este tipo de hash es una referencia se le puede llamar ```hash anonimo```. Para acceder a los elementos de un hash anonimo se usa ```->```
```perl
print $hashref->{Exusiai};
```

## Desreferenciar

Desreferenciar hace que regrese al valor al apunta la referencia, esto con el objetivo de acceder al valor real que contiene. Para hacerlo se le debe de indicar el tipo de datos antes del ```$```

```perl
%$hash_ref #se desreferencia y vuelve a ser un hash
```
