# Arquitectura funcional

## Datos privados

`profiles`

- nombre y apellido
- celular
- correo institucional
- distritos preferidos

Solo el propietario puede leerlos y modificarlos.

## Datos visibles antes del match

`puestos`

- cargo, módulos u horas cátedra
- PID
- escuela
- distrito
- días y horarios
- estado

## Regla de resultados

1. Reunir todos los PID publicados por el usuario.
2. Buscar puestos activos de otros usuarios con esos PID.
3. Excluir los propios.
4. Dividir entre distritos preferidos y otros distritos.
5. Mostrar primero los preferidos.

## Match futuro

Un interés guarda:

- el puesto propio que se ofrece
- el puesto ajeno que se desea recibir

Existe match cuando también aparece el interés inverso:

- A ofrece puesto A por puesto B
- B ofrece puesto B por puesto A

Después de una confirmación final de ambas partes, el backend podrá devolver los perfiles de los dos docentes y generar el resumen de permuta.
