---
layout: default
title: FreeBSD VM system - vmspace, vm_map, vm_map_entry, vm_object (shadowed) y vm_page
parent: FreeBSD
grand_parent: OS a Bajo Nivel
---

Como parte de comprender como funciona la administracion de memoria virtual en FreeBSD a nivel de codigo, y como una preface a las "shadow chains" y "vm_object", veremos como en el kernel de FreeBSD se implementaron y funcionan las estructuras vmspace, vm_map y vm_map_entry.

---

> In computing, virtual memory is a memory management technique that is implemented using both hardware and software. It maps memory addresses used by a program, called virtual addresses, into physical addresses in computer memory but it lacks code details

En si, este proceso de traduccion de direcciones virtuales a fisicas se realiza con el MMU (Memory Management Unit). Como sabras, en los sistemas operativos modernos cada proceso tiene su propio espacio de direcciones virtuales (VAS), que forma parte de un mecanismo del espacio de usuario para aislar procesos entre si y garantizar que un proceso externo no pueda (si se puede) realizar operaciones de lectura y escritura sobre otro proceso, FreeBSD no es la excepcion, incluso, en el caso de FreeBSD pueden ser mapeados diferentes fuente de datos (objetos) como archivos o piezas anonimas y privadas de la swap y este ultimo punto es una de las diferencias entre FreeBSD y otros OS, ya que este caso, la RAM no se asigna permanentemente a un proceso u objeto, si no que aqui funciona como una cache para las paginas (vm_page) de los objetos virtuales (vm_object) lo que permite reutilizar la memoria y reducir el tiempo de acceso a datos que son usados con frecuencia, y en escencia un manejo mas eficiente de la memoria fisica.

Por parte del espacio de kernel y espacio de usuario, se usan las mismas estructuras que son; **vmspace, vm_map, vm_map_entry, vm_object (tambien shadow) y vm_page**, estas son la clave de como se estructura la memoria virtual en FreeBSD.

# vmspace

Es una estructura de alto nivel que integra componentes dependientes e independientes del hardware para gestionar y llevar un seguimiento del VAS de un proceso. Esta es la estructura base del VAS de cada proceso. Cuando se menciona que "integra componentes independientes", esto quiere decir que no dependen de las caracteristicas fisicas del CPU o memoria fisica, si no que son una abstraccion del diseño del OS, por ejemplo "vm_map" que veremos mas adelante.

Se define de la siguiente forma en el archivo `vm_map.h` en la linea 298:

```c
struct vmspace {
        struct vm_map vm_map;   /* VM address map */
        struct shmmap_state *vm_shm;    /* SYS5 shared memory private data XXX */
        segsz_t vm_swrss;       /* resident set size before last swap */
        segsz_t vm_tsize;       /* text size (pages) XXX */
        segsz_t vm_dsize;       /* data size (pages) XXX */
        segsz_t vm_ssize;       /* stack size (pages) */
        caddr_t vm_taddr;       /* (c) user virtual address of text */
        caddr_t vm_daddr;       /* (c) user virtual address of data */
        caddr_t vm_maxsaddr;    /* user VA at max stack growth */
        vm_offset_t vm_stacktop; /* top of the stack, may not be page-aligned */
        vm_offset_t vm_shp_base; /* shared page address */
        u_int vm_refcnt;        /* number of references */
        /*
         * Keep the PMAP last, so that CPU-specific variations of that
         * structure on a single architecture don't result in offset
         * variations of the machine-independent fields in the vmspace.
         */
        struct pmap vm_pmap;    /* private physical map */
};
```

De momento solo nos centraremos en el campo `struct vm_map vm_map;` y `struct pmap vm_pmap;`, el primero contiene el mapeo completo de las direcciones virtuales del proceso, otra forma de explicarlo es que contiene todo el rango usable de direcciones virtuales para ese proceso.

### ¿Como se inicializa vmspace?

Basicamente se inicializa en el contexto de la creacion de un nuevo proceso con fork(), sin embargo, cuando un proceso hijo es creado a partir de un proceso padre, esto se hace mediante la funcion `vmspace_fork()`, que permite copiar la informacion del VAS y virtual map del padre al hijo. Se declara en la linea `4344` del archivo `vm_map.c`:

```c
struct vmspace * 
vmspace_fork(struct vmspace *vm1, vm_ooffset_t *fork_charge)
{
        struct vmspace *vm2;
        vm_map_t new_map, old_map;
        vm_map_entry_t new_entry, old_entry;
        vm_object_t object;
        int error, locked __diagused;
        vm_inherit_t inh;
 
        old_map = &vm1->vm_map;
        /* Copy immutable fields of vm1 to vm2. */
        vm2 = vmspace_alloc(vm_map_min(old_map), vm_map_max(old_map),
            pmap_pinit);
        if (vm2 == NULL)
                return (NULL);
 
        vm2->vm_taddr = vm1->vm_taddr;
        vm2->vm_daddr = vm1->vm_daddr;
        vm2->vm_maxsaddr = vm1->vm_maxsaddr;
        vm2->vm_stacktop = vm1->vm_stacktop;
        vm2->vm_shp_base = vm1->vm_shp_base;
        vm_map_lock(old_map);
        if (old_map->busy)
                vm_map_wait_busy(old_map);
        new_map = &vm2->vm_map;
        locked = vm_map_trylock(new_map); /* trylock to silence WITNESS */
        KASSERT(locked, ("vmspace_fork: lock failed"));
 
        error = pmap_vmspace_copy(new_map->pmap, old_map->pmap);
        if (error != 0) {
                sx_xunlock(&old_map->lock);
                sx_xunlock(&new_map->lock);
                vm_map_process_deferred();
                vmspace_free(vm2);
                return (NULL);
        }
 
        new_map->anon_loc = old_map->anon_loc;
        new_map->flags |= old_map->flags & (MAP_ASLR | MAP_ASLR_IGNSTART |
            MAP_ASLR_STACK | MAP_WXORX);
 
        VM_MAP_ENTRY_FOREACH(old_entry, old_map) {
                if ((old_entry->eflags & MAP_ENTRY_IS_SUB_MAP) != 0)
                        panic("vm_map_fork: encountered a submap");
 
                inh = old_entry->inheritance;
                if ((old_entry->eflags & MAP_ENTRY_GUARD) != 0 &&
                    inh != VM_INHERIT_NONE)
                        inh = VM_INHERIT_COPY;
 
                switch (inh) {
                case VM_INHERIT_NONE:
                        break;
 
                case VM_INHERIT_SHARE:
                        /*
                         * Clone the entry, creating the shared object if
                         * necessary.
                         */
                        object = old_entry->object.vm_object;
                        if (object == NULL) {
                                vm_map_entry_back(old_entry);
                                object = old_entry->object.vm_object;
                        }
 
                        /*
                         * Add the reference before calling vm_object_shadow
                         * to insure that a shadow object is created.
                         */
                        vm_object_reference(object);
                        if (old_entry->eflags & MAP_ENTRY_NEEDS_COPY) {
                                vm_object_shadow(&old_entry->object.vm_object,
                                    &old_entry->offset,
                                    old_entry->end - old_entry->start,
                                    old_entry->cred,
                                    /* Transfer the second reference too. */
                                    true);
                                old_entry->eflags &= ~MAP_ENTRY_NEEDS_COPY;
                                old_entry->cred = NULL;
 
                                /*
                                 * As in vm_map_merged_neighbor_dispose(),
                                 * the vnode lock will not be acquired in
                                 * this call to vm_object_deallocate().
                                 */
                                vm_object_deallocate(object);
                                object = old_entry->object.vm_object;
                        } else {
                                VM_OBJECT_WLOCK(object);
                                vm_object_clear_flag(object, OBJ_ONEMAPPING);
                                if (old_entry->cred != NULL) {
                                        KASSERT(object->cred == NULL,
                                            ("vmspace_fork both cred"));
                                        object->cred = old_entry->cred;
                                        object->charge = old_entry->end -
                                            old_entry->start;
                                        old_entry->cred = NULL;
                                }
 
                                /*
                                 * Assert the correct state of the vnode
                                 * v_writecount while the object is locked, to
                                 * not relock it later for the assertion
                                 * correctness.
                                 */
                                if (old_entry->eflags & MAP_ENTRY_WRITECNT &&
                                    object->type == OBJT_VNODE) {
                                        KASSERT(((struct vnode *)object->
                                            handle)->v_writecount > 0,
                                            ("vmspace_fork: v_writecount %p",
                                            object));
                                        KASSERT(object->un_pager.vnp.
                                            writemappings > 0,
                                            ("vmspace_fork: vnp.writecount %p",
                                            object));
                                }
                                VM_OBJECT_WUNLOCK(object);
                        }
 
                        /*
                         * Clone the entry, referencing the shared object.
                         */
                        new_entry = vm_map_entry_create(new_map);
                        *new_entry = *old_entry;
                        new_entry->eflags &= ~(MAP_ENTRY_USER_WIRED |
                            MAP_ENTRY_IN_TRANSITION);
                        new_entry->wiring_thread = NULL;
                        new_entry->wired_count = 0;
                        if (new_entry->eflags & MAP_ENTRY_WRITECNT) {
                                vm_pager_update_writecount(object,
                                    new_entry->start, new_entry->end);
                        }
                        vm_map_entry_set_vnode_text(new_entry, true);
 
                        /*
                         * Insert the entry into the new map -- we know we're
                         * inserting at the end of the new map.
                         */
                        vm_map_entry_link(new_map, new_entry);
                        vmspace_map_entry_forked(vm1, vm2, new_entry);
 
                        /*
                         * Update the physical map
                         */
                        pmap_copy(new_map->pmap, old_map->pmap,
                            new_entry->start,
                            (old_entry->end - old_entry->start),
                            old_entry->start);
                        break;
 
                case VM_INHERIT_COPY:
                        /*
                         * Clone the entry and link into the map.
                         */
                        new_entry = vm_map_entry_create(new_map);
                        *new_entry = *old_entry;
                        /*
                         * Copied entry is COW over the old object.
                         */
                        new_entry->eflags &= ~(MAP_ENTRY_USER_WIRED |
                            MAP_ENTRY_IN_TRANSITION | MAP_ENTRY_WRITECNT);
                        new_entry->wiring_thread = NULL;
                        new_entry->wired_count = 0;
                        new_entry->object.vm_object = NULL;
                        new_entry->cred = NULL;
                        vm_map_entry_link(new_map, new_entry);
                        vmspace_map_entry_forked(vm1, vm2, new_entry);
                        vm_map_copy_entry(old_map, new_map, old_entry,
                            new_entry, fork_charge);
                        vm_map_entry_set_vnode_text(new_entry, true);
                        break;
 
                case VM_INHERIT_ZERO:
                        /*
                         * Create a new anonymous mapping entry modelled from
                         * the old one.
                         */
                        new_entry = vm_map_entry_create(new_map);
                        memset(new_entry, 0, sizeof(*new_entry));
 
                        new_entry->start = old_entry->start;
                        new_entry->end = old_entry->end;
                        new_entry->eflags = old_entry->eflags &
                            ~(MAP_ENTRY_USER_WIRED | MAP_ENTRY_IN_TRANSITION |
                            MAP_ENTRY_WRITECNT | MAP_ENTRY_VN_EXEC |
                            MAP_ENTRY_SPLIT_BOUNDARY_MASK);
                        new_entry->protection = old_entry->protection;
                        new_entry->max_protection = old_entry->max_protection;
                        new_entry->inheritance = VM_INHERIT_ZERO;
 
                        vm_map_entry_link(new_map, new_entry);
                        vmspace_map_entry_forked(vm1, vm2, new_entry);
 
                        new_entry->cred = curthread->td_ucred;
                        crhold(new_entry->cred);
                        *fork_charge += (new_entry->end - new_entry->start);
 
                        break;
                }
        }
        /*
         * Use inlined vm_map_unlock() to postpone handling the deferred
         * map entries, which cannot be done until both old_map and
         * new_map locks are released.
         */
        sx_xunlock(&old_map->lock);
        sx_xunlock(&new_map->lock);
        vm_map_process_deferred();
 
        return (vm2);
}
```

Como puedes ver es un monton, que en resumen, como habia dicho antes "permite copiar la informacion del VAS y virtual map del padre al hijo", que en el codigo las variables `vm1` y `vm2` son las que contiene la informacion del VAS del padre e hijo respectivamente. Lo primero que se hace es crear un nuevo `vmspace` para el hijo

```c
vm2 = vmspace_alloc(vm_map_min(old_map), vm_map_max(old_map), pmap_pinit);
```

La funcion `vmspace_alloc` de define como

```c
vmspace_alloc(vm_offset_t min, vm_offset_t max, pmap_pinit_t pinit)
{
        struct vmspace *vm;
 
        vm = uma_zalloc(vmspace_zone, M_WAITOK);
        KASSERT(vm->vm_map.pmap == NULL, ("vm_map.pmap must be NULL"));
        if (!pinit(vmspace_pmap(vm))) {
                uma_zfree(vmspace_zone, vm);
                return (NULL);
        }
        CTR1(KTR_VM, "vmspace_alloc: %p", vm);
        _vm_map_init(&vm->vm_map, vmspace_pmap(vm), min, max);
        refcount_init(&vm->vm_refcnt, 1);
        vm->vm_shm = NULL;
        vm->vm_swrss = 0;
        vm->vm_tsize = 0;
        vm->vm_dsize = 0;
        vm->vm_ssize = 0;
        vm->vm_taddr = 0;
        vm->vm_daddr = 0;
        vm->vm_maxsaddr = 0;
        return (vm);
}
```

En esta creacion del nuevo vmspace, tambien se incluye la inicializacion de los `vm_map` y `pmap` para el proceso hijo usando las funciones `_vm_map_init`. Tambien me gustaria destacar la funcion `uma_zalloc` que asigna memoria de un conjunto de objetos prealocados como parte de UMA (Universal Memory Allocator).

Asi mismo me gustaria recalcar la lineas

```c
KASSERT(vm->vm_map.pmap == NULL, ("vm_map.pmap must be NULL"));
```

Que usando la macro `KASSERT` se verifica si que el `pmap` del `vm_map` se haya inicializado correctamente, mas concreto que no sea NULL, esto es importante por que `uma_zalloc` asigna memoria desde `vmspace_zone`, y cuando `uma_zalloc` devuelva la estructura que apunta a la memoria, debe estar limpia, que en la practica se puede llenar con ceros, de lo contrario indica que el `vmspace` esta corrupto.

**¿Que es lo que se copia del VAS al proceso hijo exactamente?**

Eso lo podemos ver en las siguientes lineas

```c
vm2->vm_taddr = vm1->vm_taddr;
vm2->vm_daddr = vm1->vm_daddr;
vm2->vm_maxsaddr = vm1->vm_maxsaddr;
vm2->vm_stacktop = vm1->vm_stacktop;
vm2->vm_shp_base = vm1->vm_shp_base;
vm_map_lock(old_map);
```

- vm_taddr: Direccion base del segmento de texto
- vm_daddr: Direccion base del segmento de datos
- vm_maxsaddr: Direccion del limite inferior de la pila
- vm_stacktop: Direccion inicial de la pila
- vm_shp_base: Direccion base de la memoria compartida

**¿Que es lo que se copia del vm_map al proceso hijo?**

Esto lo podemos ver dentro de las lineas

```c
VM_MAP_ENTRY_FOREACH(old_entry, old_map) {
...
}
```

Como su nombre lo indica, permite recorrer todas las entrada del PMAP, y dependiendo del tipo de herencia del proceso padre al hijo, sera la accion, 

- VM_INHERIT_SHARE: Se crea una referencia compartida a las mismas páginas de memoria fisica
- VM_INHERIT_COPY: Esto va relacionado con el anterior, en caso de que alguno de los dos procesos modifica las paginas de memoria fisica, se crea una copia privada (aislada del otro proceso) para el proceso que las modifico, esto se hace mediante COW (Copy-On-Write)
- VM_INHERIT_ZERO: Crea una nueva region de memoria anonima vacia, con anonima se refiere a que no esta asociado a ningun descriptor de archivos y en general a ningun recurso del sistema de archivos

Sabiendo todo esto ya podemos pasar al `vm_map`

# vm_map

Describe el VAS de un proceso de manera independiente del hardware, que como mencione antes "contiene el mapeo completo de las direcciones virtuales del proceso".
En si vm_map apunta a una lista enlazada ordenada de estructuras `vm_map_entry` y a un arbol de busqueda binario como se oberva en la imagen

![](/assets/img/freebsd-vm/1.jpg)

Se declara como 

```c
struct vm_map {
        struct vm_map_entry header;     /* List of entries */
        union {
                struct sx lock;                 /* Lock for map data */
                struct mtx system_mtx;
        };
        int nentries;                   /* Number of entries */
        vm_size_t size;                 /* virtual size */
        u_int timestamp;                /* Version number */
        u_int flags;                    /* flags for this vm_map */
        vm_map_entry_t root;            /* Root of a binary search tree */
        pmap_t pmap;                    /* (c) Physical map */
        vm_offset_t anon_loc;
        int busy;
#ifdef DIAGNOSTIC
        int nupdates;
#endif
};
```

El primer miembro (struct vm_map_entry header;) apunta a la cabeza de la lista de enlazada de `vm_map_entry`, donde cada nodo de la lista representa un rango de direcciones contiguas, lo que permite relizar busquedas entre las diferentes regiones de memoria virtual. Otro miembro importante del struct es `vm_size_t size;`, que contiene el tamaño total en bytes del VAS


### ¿Donde se inicializa?

Mediante la funcion `_vm_map_init`:

```c
static void _vm_map_init(vm_map_t map, pmap_t pmap, vm_offset_t min, vm_offset_t max)
{
 
        map->header.eflags = MAP_ENTRY_HEADER;
        map->pmap = pmap;
        map->header.end = min;
        map->header.start = max;
        map->flags = 0;
        map->header.left = map->header.right = &map->header;
        map->root = NULL;
        map->timestamp = 0;
        map->busy = 0;
        map->anon_loc = 0;
#ifdef DIAGNOSTIC
        map->nupdates = 0;
#endif
}
```

Tiene como objetivo configurar los valores iniciales de un `vm_map` y `pmap`, aqui quiero destacar la flag `MAP_ENTRY_HEADER`, que es una macro declarada como

```c
#define MAP_ENTRY_HEADER                0x00080000
```

La cual indica `tracked writeable mapping`, eso quiere decir que el `vm_map` esta siendo rastreado por el kernel para detectar accesos y modificaciones.

# vm_map_entry

Representa el rango de direcciones virtuales contiguas, donde cada entrada de `vm_map_entry` apunta a una *cadena de objetos en memoria* (vm_object), que describe el origen de los datos mepeados en rango de direcciones indicado, ese rango se define en el miembro `vm_offset_t start;` y `vm_offset_t end;` de vm_map_entry. El miembro mas relevante de la estructura es el union `union vm_map_object object;`, que es tal cual la abstraccion del objeto que se esta mapenado en el rango de direcciones virtuales, este puede ser cualquier fuente de datos, podria ser un archivo, ejecutable, objeto swap si se esta mapeando memoria anonima, incluso un dispositivo que esta mapeando al frame buffer.
Otro miembro que es importante de la estructura es `vm_ooffset_t offset`, que indica el desplazamiento desde donde se empezo a mapeo de las direcciones virtuales. Una mejor representacion se observa en la siguiente imagen

![](/assets/img/freebsd-vm/2.jpg)

Observa como dos `vm_map_entry` apuntan al mismo vm_object pero con diferente offset, esto toma sentido por que si dos procesos estan compartiendo memoria, esos dos procesos pueden hacer referencia al mismo offset, lo que permite saber que si un proceso cambia algo, el otro puede ver los cambios.

Para concluir con las estructuras de usadas en la administracion de memoria virtual en FreeBSD, llegamos hasta la parte final; `vm_object` y `vm_page`

# vm_object

Como se menciono en el anterior post "un vm_object es abstraccion del objeto que se esta mapenado en el rango de direcciones virtuales". Esto representa una fuente de datos mapeada en el espacio de direcciones virtuales de un proceso, como memoria física, archivos o memoria compartida.

Cuando un proceso se ejecuta, su espacio de direcciones virtuales incluye diferentes tipos de `vm_object`, el código del programa en donde los datos iniciales se mapean desde el archivo binario (ejecutable), el código (seccion .text) es de solo lectura y los datos (seccion .data) son copy-on-write (COW), lo que significa que si el proceso intenta modificar esos datos, el sistema operativo crea una copia privada de la página para evitar modificar el archivo original, esto se menciono en el anterior post en la funcion `VM_MAP_ENTRY_FOREACH`, mas que nada en el uso de `VM_INHERIT_COPY`.

La sección BSS (datos no inicializados) se asigna como páginas de memoria anonima (VM_INHERIT_ZERO), que son páginas llenas de ceros cuando se acceden por primera vez (se le conoce como Demand Zero Page Fill). También se pueden mapear archivos arbitrarios como memoria compartida, donde cada proceso puede tener una copia privada o una referencia compartida al archivo.

Cuando un proceso hace un fork(), el sistema operativo no crea una copia completa del espacio de direcciones si no que reutiliza las páginas existentes y las marca como copy-on-write, de modo que si uno de los procesos modifica una página, se crea una copia privada solo para ese proceso, lo que permite ahorrar memoria y mejorar el rendimiento, ya que solo las páginas modificadas realmente se copian, mientras que las páginas de solo lectura o sin modificaciones siguen siendo compartidas entre ambos procesos

Otros puntos importante a tomar en cuenta

- Cada estructura `vm_object` contiene una lista ordenada de estructuras `vm_page` que representan la
cache de memoria física del `vm_object`
- Si el vm_object entre dos procesos es privado o COW, se pueden crear cadenas de objetos o como correctamente se les dice "shadow objects"

La forma en la que se estructura es la siguiente

```c
struct vm_object {
        struct rwlock lock;
        TAILQ_ENTRY(vm_object) object_list; /* list of all objects */
        LIST_HEAD(, vm_object) shadow_head; /* objects that this is a shadow for */
        LIST_ENTRY(vm_object) shadow_list; /* chain of shadow objects */
        struct pglist memq;             /* list of resident pages */
        struct vm_radix rtree;          /* root of the resident page radix trie*/
        vm_pindex_t size;               /* Object size */
        struct domainset_ref domain;    /* NUMA policy. */
        volatile int generation;        /* generation ID */
        int cleangeneration;            /* Generation at clean time */
        volatile u_int ref_count;       /* How many refs?? */
        int shadow_count;               /* how many objects that this is a shadow for */
        vm_memattr_t memattr;           /* default memory attribute for pages */
        objtype_t type;                 /* type of pager */
        u_short pg_color;               /* (c) color of first page in obj */
        u_int flags;                    /* see below */
        blockcount_t paging_in_progress; /* (a) Paging (in or out) so don't collapse or destroy */
        blockcount_t busy;              /* (a) object is busy, disallow page busy. */
        int resident_page_count;        /* number of resident pages */
        struct vm_object *backing_object; /* object that I'm a shadow of */
        vm_ooffset_t backing_object_offset;/* Offset in backing object */
        TAILQ_ENTRY(vm_object) pager_object_list; /* list of all objects of this pager type */
        LIST_HEAD(, vm_reserv) rvq;     /* list of reservations */
        void *handle;
        ...
}
```

Observa que el segundo miembro del struct es una lista de "shadow objects", pero ¿Que es eso?

## shadow objects

En escencia son estructuras que se interponen entre un vm_object original y las entradas del mapa de direcciones (vm_map_entry) de los procesos, exactamente son usados en la implementacion de Copy-on-Write (COW) para permitir que varios procesos compartan el mismo vm_object y modifiquen una copia privada de ese objeto sin que afecte a los demas procesos, entonces podemos decir que

- Si un proceso hace fork(), el nuevo proceso hereda el `vm_map_entry`, pero el `vm_object` se convierte en COW, lo que creara un `shadow object` en caso de que uno de ambos procesos requiera modificarlo. Desglosandolo a paso
    - Cuando se hce un fork, el padre el y el hijo comparten las mismas paginas de memoria
    - Cuando uno de los procesos intenta modificar una de las paginas se activa COW
    - Ahora se crea un shadow object para la pagina que sera modificada. Entonces la pagina original no se toca

Este mecanismo reduce la sobrecarga de memoria permitiendo aumentar la eficiencia.

**Puntos clave**
- Los shadow object representan copias de los datos originales
- Los shadow objects son transistorios, lo que indica que si ya no se usan se autodestruyen-
- Si uno de los procesos no requiere modificar las paginas de memoria, se puede seguir usando el mismo vm_object original

# vm_page

De aqui no hay mucho que decir, ya que las vm_page son las estructuras de mas bajo nivel en la memoria virtual, y representan la memoria fisica que esta siendo usada por el sistema de memoria virtual de FreeBSD.

**Puntos clave**
- Cada vm_page hace referencia a una pagina fisica de la memoria fisica, esto se observa en el miebro `vm_paddr_t phys_addr;` de su estructura.
- Por cada pagina de memoria fisica de 4 Kb, habra una estructura `vm_page`.
- Un vm_object puede tener varias vm_page, esto se observa en el miembro `vm_object_t object;` de la estructura

## Referencias

- https://www.leidinger.net/FreeBSD/dox/vm/html/index.html
- https://docs-archive.freebsd.org/doc/6.2-RELEASE/usr/share/doc/en/articles/vm-design/vm-objects.html
- The Design and Implementation of the FreeBSD Operating System (2nd Edition)
- https://docs.freebsd.org/en/articles/vm-design/