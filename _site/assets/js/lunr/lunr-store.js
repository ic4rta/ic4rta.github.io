var store = [{
        "title": "BoF stack-based",
        "excerpt":"Contenido ¿Que es buffer overflow?. Layout del stack. Analisis el codigo fuente del binario Desbordando el buffer. Calculando el offset y tomando el control del RIP. Ejecutando la shellcode. ¿Que es buffer overflow? El buffer es un espacio en la memoria en el cual se almacenan datos de manera temporal...","categories": ["Explotacion binaria"],
        "tags": ["bof","gdb"],
        "url": "http://localhost:4000/bof-stack-based/",
        "teaser":null},{
        "title": "Format string",
        "excerpt":"Contenido ¿Que es format string? Calling conventions Lekeando valores de la memoria Resolviendo un pequeño ejercicio Visualizandolo en radare2 ¿Que es format string? Vulnerabilidad la cual ocurre cuando los inputs de los usuarios son ejecutados y procesados como comandos por una funcion vulnerable, esto permite que se puedan lekear valores...","categories": ["Explotacion binaria"],
        "tags": ["formatStr","radare2"],
        "url": "http://localhost:4000/format-string/",
        "teaser":null},{
        "title": "picoCTF - Hurry up! Wait!",
        "excerpt":"Contenido Sacando informacion del binario. Debugging al binario con radare2. Sacando informacion del binario Lo primero que vemos a la hora de descargar el binario de la pagina de picoCTF es un binario con el nombre svchost.exe, con ese nombre uno pensaria que es un binario .exe para ser ejecutado...","categories": ["picoCTF","Reversing"],
        "tags": ["radare2"],
        "url": "http://localhost:4000/picoCTF-hurryUp/",
        "teaser":null},{
        "title": "ret2libc bypass NX",
        "excerpt":"Contenido ¿Que es ret2libc?. ¿Que es No Executable (NX)?. Un poco de Return Oriented Programming (ROP). Analizando nuestro binario. Explicando el payload que usaremos. Desbordando el buffer y calculando el offset del RIP. Consiguiendo la direccion de libc. Consiguiendo los offset de ret, pop rdi ret, /bin/sh y system(). Creando...","categories": ["Explotacion binaria"],
        "tags": ["ret2libc","gdb","bof"],
        "url": "http://localhost:4000/ret2libc/",
        "teaser":null},{
        "title": "GOT overwrite con Format String",
        "excerpt":"Contenido Global Offset Table (GOT) y Procedure Linked Table (PLT) Analisis del binario Calculando el offset del buffer y la direccion de libc Armando nuestro exploit GOT y PLT Para entender esto mejor veremos la estructura de un binario ELF. Ahora pondre otra estructura donde section header table apunta a...","categories": ["Explotacion binaria"],
        "tags": ["got-plt","gdb","formatStr"],
        "url": "http://localhost:4000/got-overwrite/",
        "teaser":null},{
        "title": "ImaginaryCTF date2 - GOT overwrite",
        "excerpt":"Contenido Analizando el binario con Ghidra Ejecutando el exploit Analizando el binario con Ghidra Este ejercicio es muy similar al enterior del post de GOT overwrite solo que ahora no podemos ver el codigo fuente del binario, asi que lo que nos toca es analizarlo con ghidra Lo primero que...","categories": ["Explotacion binaria"],
        "tags": ["got-plt","ghidra","formatStr"],
        "url": "http://localhost:4000/imaginaryCTF-date2/",
        "teaser":null}]
