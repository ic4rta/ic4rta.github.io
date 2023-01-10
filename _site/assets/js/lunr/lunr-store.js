var store = [{
        "title": "BoF stack-based",
        "excerpt":"Contenido ¿Que es buffer overflow?. Layout del stack. Analisis el codigo fuente del binario Desbordando el buffer. Calculando el offset y tomando el control del RIP. Ejecutando la shellcode. ¿Que es buffer overflow? El buffer es un espacio en la memoria en el cual se almacenan datos de manera temporal...","categories": ["Explotacion binaria"],
        "tags": ["bof-stack-based"],
        "url": "http://localhost:4000/bof-stack-based/",
        "teaser":null},{
        "title": "Format string",
        "excerpt":"Contenido ¿Que es format string? Calling conventions Lekeando valores de la memoria Resolviendo un pequeño ejercicio Visualizandolo en radare2 ¿Que es format string? Vulnerabilidad la cual ocurre cuando los inputs de los usuarios son ejecutados y procesados como comandos por una funcion vulnerable, esto permite que se puedan lekear valores...","categories": ["Explotacion binaria"],
        "tags": ["format-string"],
        "url": "http://localhost:4000/format-string/",
        "teaser":null},{
        "title": "picoCTF - Hurry up! Wait!",
        "excerpt":"Contenido Sacando informacion del binario. Debugging al binario con radare2. Sacando informacion del binario Lo primero que vemos a la hora de descargar el binario de la pagina de picoCTF es un binario con el nombre svchost.exe, con ese nombre uno pensaria que es un binario .exe para ser ejecutado...","categories": ["Reversing"],
        "tags": ["radare2"],
        "url": "http://localhost:4000/picoCTF-hurryUp/",
        "teaser":null},{
        "title": "ret2libc bypass NX",
        "excerpt":"Contenido ¿Que es ret2libc?. ¿Que es No Executable (NX)?. Un poco de Return Oriented Programming (ROP). Analizando nuestro binario. Explicando el payload que usaremos. Desbordando el buffer y calculando el offset del RIP. Consiguiendo la direccion de libc. Consiguiendo los offset de ret, pop rdi ret, /bin/sh y system(). Creando...","categories": ["Explotacion binaria"],
        "tags": ["ret2libc","rop"],
        "url": "http://localhost:4000/ret2libc/",
        "teaser":null},{
        "title": "GOT overwrite con Format String",
        "excerpt":"Contenido Global Offset Table (GOT) y Procedure Linked Table (PLT) Analisis del binario Calculando el offset del buffer y la direccion de libc Armando nuestro exploit GOT y PLT Para entender esto mejor veremos la estructura de un binario ELF. Ahora pondre otra estructura donde section header table apunta a...","categories": ["Explotacion binaria"],
        "tags": ["got-overwrite","format-string"],
        "url": "http://localhost:4000/got-overwrite/",
        "teaser":null},{
        "title": "ImaginaryCTF date2 - GOT overwrite",
        "excerpt":"Contenido Analizando el binario con Ghidra Ejecutando el exploit Analizando el binario con Ghidra Este ejercicio es muy similar al enterior del post de GOT overwrite y para practicar esta perfecto, solo que ahora no podemos ver el codigo fuente del binario, asi que lo que nos toca es analizarlo...","categories": ["Explotacion binaria"],
        "tags": ["got-overwrite","format-string"],
        "url": "http://localhost:4000/imaginaryCTF-date2/",
        "teaser":null},{
        "title": "IOF - Integer Overflow/Underflow",
        "excerpt":"Contenido Integer Overflow y underflow Analizando y explotando el binario Integer Overflow y underflow Primeramente voy a explicar un poco acerca de los tipo de datos en C, pero mas que nada el maximo valor que pueden almacenar. Las variables que solo pueden almacenar valores positivos se llaman unsigned integers,...","categories": ["Explotacion binaria"],
        "tags": ["integer-overflow"],
        "url": "http://localhost:4000/integer-overflow/",
        "teaser":null},{
        "title": "Leak stack canary - bypass",
        "excerpt":"Contenido Que es el stack canary y como funciona Analizando el binario Lekeando el canary Sacando el offset del canary Ejecutando nuestro exploit Que es el stack canary y como funciona El stack canary es un valor random que se genera en el stack y cambia cada vez que se...","categories": ["Explotacion binaria"],
        "tags": ["format-string","canary-bypass"],
        "url": "http://localhost:4000/leak-stack-canary/",
        "teaser":null},{
        "title": "Bypass ASLR/NX",
        "excerpt":"Hay muchas mas formas de hacer bypass del ASLR, asi que no se queden solo con esta Contenido ASLR Analizando el binario Calculando el offset el RIP Sacando las direcciones de puts y puts@got Sacando la direccion de pop rdi; ret Sacando los offsets de puts, system y sh usando...","categories": ["Explotacion binaria"],
        "tags": ["ret2libc","aslr-bypass","bof-stack-based"],
        "url": "http://localhost:4000/bypass-aslr-nx/",
        "teaser":null},{
        "title": "Explotanto un PRNG bad seed",
        "excerpt":"Puede ser que conozcas acerca de la generacion de numeros aleatorios, y en caso de que hayas programado en C algo que genere numeros aleatorios, talvez hayas usado la funcion rand();, asi que hoy te voy a mostrar como aprovecharte de esa funcion y de lo que se conoce como...","categories": ["Explotacion binaria"],
        "tags": ["bad-seed"],
        "url": "http://localhost:4000/prng-bad-seeds/",
        "teaser":null},{
        "title": "Introduccion a la explotacion binaria",
        "excerpt":"Creo que debi de hacer este post antes de los demas pero pues se me olvido jiji, asi que ahora te voy a dar una pequeña introduccion sobre algunos temas que considero, son relevantes para iniciar en la explotacion binaria, o mas que nada antes de explotar tu primer buffer...","categories": ["Explotacion binaria"],
        "tags": [],
        "url": "http://localhost:4000/introduccion-pwn/",
        "teaser":null},{
        "title": "ROPemporium ret2win - saltando a una funcion con ROP",
        "excerpt":"Este es el primer desafio de la pagina ROPemporium, dedicada a la explotacion binaria y mas que nada al uso de la tecnica llamada ROP (Return Oriented Programming) Analisis del binario Primeramente podemos empezar a sacar informacion del binario, ya sea con checksec (pwntools) o rabin2 (radare2), el resultado que...","categories": ["Explotacion binaria"],
        "tags": ["rop"],
        "url": "http://localhost:4000/rop-empurium-ret2win/",
        "teaser":null},{
        "title": "picoCTF web gauntlet - sql injection y evadiendo filtros",
        "excerpt":"Para este desafio tenemos que hacer bypass de varios filtros usando sql injection, el SGBD es sqlite y el usuario para todos los casos es admin http://jupiter.challenges.picoctf.org:41560/ –&gt; Pagina vulnerable http://jupiter.challenges.picoctf.org:41560/filter.php –&gt; Filtro de cada round Round 1 El primer filtro de debemos de evadir es or, al llenar los...","categories": ["Web"],
        "tags": ["sqli"],
        "url": "http://localhost:4000/picoCTF-web-gauntlet/",
        "teaser":null},{
        "title": "TAMU 2019 pwn1 - BufferOverflow",
        "excerpt":"El binario lo pueden descargar con: wget https://github.com/guyinatuxedo/nightmare/raw/master/modules/04-bof_variable/tamu19_pwn1/pwn1 Analisis El binario cuenta con las siguientes protecciones: RELRO STACK CANARY NX PIE RPATH RUNPATH Symbols FORTIFY Fortified Fortifiable FILE Full RELRO No canary found NX enabled PIE enabled No RPATH No RUNPATH 77 Symbols No 0 2 pwn1 No tienec Canary...","categories": ["Explotacion binaria"],
        "tags": ["bof-stack-based"],
        "url": "http://localhost:4000/TAMU-2019-pwn1/",
        "teaser":null},{
        "title": "Programación Orientada a Sigreturn (SROP)",
        "excerpt":"Señales Las señales son un mecanismo para enviar notificaciones asincrónicas directamente a un proceso o subproceso. Este se utilizan para matar procesos, para decirles que los temporizadores han expirado o para notificar sobre un comportamiento anormal. Funcion de las señales Cuando se tiene un proceso previamente creado, lo que se...","categories": ["Explotacion binaria"],
        "tags": ["srop","rop"],
        "url": "http://localhost:4000/srop/",
        "teaser":null}]
