# Permutas Docentes Brown — MVP 1

Primer prototipo funcional para publicar cargos, módulos u horas cátedra titulares y encontrar ofrecimientos con el mismo código PID.

## Qué incluye esta entrega

- Registro obligatorio con nombre, apellido, celular, correo y contraseña.
- Restricción real para correos `@abc.gob.ar`.
- Confirmación del correo electrónico.
- Login y cierre de sesión.
- Rutas privadas protegidas.
- Perfil privado del docente.
- Selector múltiple de distritos preferidos.
- Alta de una cantidad ilimitada de puestos.
- Modificación y eliminación de puestos propios.
- Selector de distrito, día y horario.
- Búsqueda de publicaciones con los mismos PID.
- Orden: primero distritos preferidos, después los demás.
- Los ofrecimientos no muestran nombre, teléfono ni correo.
- Base de datos preparada para incorporar intereses y match recíproco.

Los botones **Me interesa** y **No me sirve** aparecen en la interfaz, pero la acción de match se implementará en la siguiente etapa.

---

## Tecnología elegida

- **Next.js + TypeScript:** interfaz, rutas y servidor.
- **Supabase Auth:** registro, verificación de correo, login y sesión.
- **Supabase PostgreSQL:** perfiles, puestos, preferencias e intereses.
- **Row Level Security:** cada docente solo puede modificar sus datos y puestos.

No hace falta construir un servidor aparte para este MVP.

---

# Puesta en marcha

## 1. Crear el proyecto en Supabase

1. Entrá a `https://supabase.com`.
2. Creá un proyecto nuevo.
3. Guardá la contraseña de la base.
4. Esperá a que el proyecto termine de inicializarse.

## 2. Crear las tablas y reglas de seguridad

1. En Supabase, abrí **SQL Editor**.
2. Elegí **New query**.
3. Copiá y ejecutá completo:

   `supabase/001_initial_schema.sql`

Este archivo crea perfiles, puestos, intereses, índices, triggers y políticas RLS.

## 3. Configurar el registro por correo

En Supabase:

1. Abrí **Authentication → Providers → Email**.
2. Activá **Email provider**.
3. Activá **Confirm email** para que la persona deba validar su cuenta `@abc.gob.ar`.
4. No habilites registro anónimo.

El SQL también crea un trigger que rechaza cualquier correo que no termine en `@abc.gob.ar`. La validación del formulario no es la única barrera.

## 4. Configurar las URLs de autenticación

En **Authentication → URL Configuration**:

Para trabajar localmente:

- Site URL: `http://localhost:3000`
- Redirect URL permitida: `http://localhost:3000/auth/callback`

Cuando publiques la app, agregá también:

- `https://TU-DOMINIO.com/auth/callback`

No borres la URL local mientras estés desarrollando.

## 5. Obtener las claves públicas

En **Project Settings → API** copiá:

- Project URL.
- `anon public` key.

Nunca uses la `service_role` en el navegador ni la subas al repositorio.

## 6. Crear el archivo de entorno

En la raíz del proyecto, copiá `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

Completalo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLICA
```

## 7. Instalar y ejecutar

Necesitás Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abrí:

`http://localhost:3000`

## 8. Probar el flujo completo

1. Crear una cuenta con un correo real `@abc.gob.ar`.
2. Revisar la bandeja y confirmar el correo.
3. Iniciar sesión.
4. Elegir distritos preferidos.
5. Cargar uno o más puestos.
6. Crear una segunda cuenta de prueba con otro correo institucional.
7. Cargar un puesto con el mismo PID.
8. Volver a la primera cuenta y comprobar que aparece en “Posibles permutas”.

Para probar el orden, cargá una publicación en un distrito preferido y otra en un distrito no seleccionado.

---

# Estructura del login y registro

## Registro

El formulario envía los datos a:

`POST /api/auth/register`

El servidor:

1. Verifica que estén completos.
2. Normaliza el correo.
3. Comprueba `@abc.gob.ar`.
4. Exige una contraseña de al menos ocho caracteres.
5. Crea el usuario en Supabase Auth.
6. Guarda nombre y celular como metadatos.
7. Envía el correo de confirmación.
8. El trigger crea automáticamente el perfil privado.

## Confirmación del correo

El enlace enviado por Supabase regresa a:

`GET /auth/callback`

La ruta intercambia el código por una sesión y envía al docente a `/panel`.

## Login

El formulario envía:

`POST /api/auth/login`

El servidor valida el dominio y usa `signInWithPassword`. Supabase genera la sesión en cookies seguras.

## Protección de rutas

`middleware.ts` protege todo lo que comienza con:

`/panel`

Sin sesión, redirige a `/login`. Con sesión activa, `/login` y `/registro` redirigen al panel.

## Cierre de sesión

El botón llama a:

`POST /api/auth/logout`

Supabase elimina la sesión y la app vuelve al login.

---

# Seguridad y privacidad

- Los correos, teléfonos y nombres están en `profiles`.
- Las políticas RLS permiten que cada docente lea solo su propio perfil.
- Las publicaciones se guardan separadas en `puestos`.
- Los demás usuarios ven cargo, PID, escuela, distrito, días y horarios.
- No pueden consultar el perfil del autor antes del match.
- El PID se normaliza en mayúsculas y sin espacios antes de guardarse.
- La `anon key` puede estar en el frontend porque RLS controla el acceso.
- La `service_role` jamás debe agregarse a `.env.local` con prefijo `NEXT_PUBLIC_`.

Para producción, configurá un proveedor SMTP propio en Supabase. El servicio de correo de prueba tiene límites y no está pensado para una app pública.

---

# Próxima etapa recomendada

1. Hacer funcionar **Me interesa**.
2. Asociar el interés a uno de los puestos propios con el mismo PID.
3. Detectar el interés inverso.
4. Pedir confirmación final a ambas partes.
5. Crear el match.
6. Recién entonces mostrar nombre, celular y correo.
7. Generar el resumen de la posible permuta.
8. Agregar estados: contacto iniciado, documentación, trámite y permuta realizada.
