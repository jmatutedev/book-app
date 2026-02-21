# Book Management App (Open Library)

Esta es una aplicación móvil híbrida desarrollada con **Ionic Angular** para la consulta y gestión de libros utilizando la API pública de Open Library. El proyecto destaca por su arquitectura limpia, manejo de estados y una estrategia de persistencia híbrida (SQLite/Web).

## 🚀 Cómo correr el proyecto

### Prerrequisitos

- **Node.js**: v18 o superior.
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio**: Para la ejecución en emulador o dispositivo físico.
- **Java JDK**: Compatible con la versión de Android Studio instalada.

### Pasos iniciales

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/jmatutedev/book-app.git
   cd book-app
   ```

````

2. **Instalar dependencias**:
```bash
npm install

````

### Ejecutar en Web (Navegador)

```bash
ionic serve

```

_Nota: En modo Web, la persistencia se realiza a través de LocalStorage._

### Ejecutar en Android (Nativo)

Para probar la persistencia con **SQLite**, sigue estos pasos:

1. **Generar el build de producción**:

```bash
ionic build

```

2. **Sincronizar con la plataforma nativa**:

```bash
ionic cap sync android

```

3. **Abrir en Android Studio**:

```bash
ionic cap open android

```

#### Configuración del Emulador (Pixel)

1. En Android Studio, ve a `Tools > Device Manager`.
2. Haz clic en `Create Device`.
3. Selecciona un dispositivo tipo **Pixel** (ej. Pixel 6 o Pixel 7).
4. Elige una imagen de sistema (recomendado **Google APIs x86_64**).
5. Finaliza la creación y presiona el botón "Play" para iniciar el emulador.
6. Ejecuta la aplicación desde Android Studio seleccionando el emulador creado.

---

## 📖 Guía de Uso

- **Exploración por Géneros**: Navega entre 4 géneros literarios definidos para ver libros de forma paginada.
- **Búsqueda Global**: Localiza cualquier libro por título, autor o palabra clave sin filtros de género.
- **Detalle del Libro**: Visualiza información relevante (portada, autor, año, descripción).
- **Listas Personalizadas**:
- Crea hasta **3 listas** con nombres únicos.
- Edita o elimina listas existentes.
- Agrega libros a tus listas (con validación de duplicados).

- **Modo Offline**: Accede a los libros consultados previamente sin conexión a internet.

---

## 🛠️ Decisiones Técnicas y Limitaciones

### Estrategia de Persistencia Híbrida

Se diseñó una capa de persistencia que detecta el entorno de ejecución:

- **Nativo (Android/iOS)**: Utiliza **SQLite** mediante el plugin oficial de Capacitor para un almacenamiento robusto y seguro.
- **Web**: Utiliza **LocalStorage** como fallback. Esto permite poder visualizar la lógica de la app en el navegador sin necesidad de compilar a nativo inmediatamente.

### Manejo de Estados de UI

Se implementó una gestión centralizada de estados para mejorar la UX:

- **Loading**: Spinners de carga durante llamadas asíncronas.
- **Error**: Mensajes claros en caso de fallos de red o de la API.
- **Empty State**: Pantallas específicas cuando no hay resultados o la base de datos está vacía.

### Limitaciones Conocidas

- **Open Library API**: Algunos libros pueden carecer de campos como autor o año de publicación en la respuesta de la API; la app maneja estos casos mostrando valores por defecto.
- **SQLite en Web**: El motor de SQLite es nativo; por lo tanto, la persistencia en navegador no utiliza archivos `.db` reales, sino el almacenamiento del navegador.

---

## 📚 Librerías Utilizadas

- **@ionic/angular**: Framework de UI para componentes móviles.
- **@capacitor-community/sqlite**: Motor de base de datos para persistencia nativa.
- **@angular/common/http**: Para el consumo eficiente de la API REST.
- **RxJS**: Manejo de flujos de datos y eventos asíncronos.

---

## ✨ Mejoras Futuras

- **Caché de Imágenes**: Implementar un sistema para persistir las portadas en el sistema de archivos del móvil.
- **Testing**: Añadir suites de pruebas unitarias con Jasmine/Karma para los servicios de datos.
- **Filtros Avanzados**: Permitir ordenamiento por fecha de publicación o relevancia.
