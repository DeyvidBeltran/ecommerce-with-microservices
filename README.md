# E-Commerce Microservices Platform

Plataforma de e-commerce simplificada construida con arquitectura de microservicios usando NestJS, PostgreSQL y Docker.

---

## Arquitectura

```
Cliente (Postman / Browser)
         │
         ▼
   API Gateway :3000
    /products/**  →  Products Service :3001  →  products_db (PostgreSQL)
    /orders/**    →  Orders Service   :3002  →  orders_db   (PostgreSQL)
                            │
                            └── consulta Products Service al crear una orden
```

Cada servicio es independiente, tiene su propia base de datos y se comunica con los demás a través de HTTP REST. Todos los servicios corren en la misma red virtual de Docker (`ecommerce-net`).

## Diagrama arquitectura

![Diagrama Arquitectura](docs/architecture-diagram.jpg)

## Diagrama Entidad-Relación

![Diagrama ER](docs/database-diagram.jpg)

### Servicios

| Servicio          | Puerto | Responsabilidad                             |
|-------------------|--------|---------------------------------------------|
| api-gateway       | 3000   | Punto de entrada único, redirige peticiones |
| products-service  | 3001   | Gestión del catálogo de productos           |
| orders-service    | 3002   | Gestión de órdenes de compra                |
| products-db       | 5432   | Base de datos PostgreSQL de productos       |
| orders-db         | 5433   | Base de datos PostgreSQL de órdenes         |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v20 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- NestJS CLI: `npm install -g @nestjs/cli`

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ecommerce-microservices.git
cd ecommerce-microservices

# Instalar dependencias en cada servicio
cd api-gateway && npm install && cd ..
cd products-service && npm install && cd ..
cd orders-service && npm install && cd ..
```

---

## Ejecución

### Opción 1 — Docker Compose (recomendado)

Levanta todos los servicios con un solo comando:

```bash
docker-compose up --build
```

Para correr en segundo plano:

```bash
docker-compose up --build -d
```

Para detener:

```bash
docker-compose down
```

### Opción 2 — Ejecución local

Primero levanta PostgreSQL con Docker:

```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=products_db \
  -p 5432:5432 \
  -d postgres:15-alpine

docker exec -it postgres-dev psql -U postgres -c "CREATE DATABASE orders_db;"
```

Luego en terminales separadas:

```bash
# Terminal 1
cd products-service && npm run start:dev

# Terminal 2
cd orders-service && npm run start:dev

# Terminal 3
cd api-gateway && npm run start:dev
```

### Variables de entorno

Crea estos archivos `.env` en cada servicio antes de correr localmente:

**`products-service/.env`**

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=products_db
```

**`orders-service/.env`**

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=orders_db
PRODUCTS_SERVICE_URL=http://localhost:3001
```

**`api-gateway/.env`**

```env
PORT=3000
PRODUCTS_SERVICE_URL=http://localhost:3001
ORDERS_SERVICE_URL=http://localhost:3002
```

---

## Endpoints disponibles

Todos los endpoints se consumen a través del API Gateway en `http://localhost:3000`.

### Productos

| Método | Endpoint      | Descripción                |
|--------|---------------|----------------------------|
| GET    | /products     | Listar todos los productos |
| GET    | /products/:id | Obtener producto por ID    |
| POST   | /products     | Crear producto             |
| PUT    | /products/:id | Actualizar producto        |

**Ejemplo — Crear producto:**

```json
POST /products
{
  "name": "Laptop",
  "description": "Laptop gamer 16GB RAM",
  "price": 1500,
  "stock": 10
}
```

### Órdenes

| Método | Endpoint    | Descripción              |
|--------|-------------|--------------------------|
| GET    | /orders     | Listar todas las órdenes |
| GET    | /orders/:id | Obtener orden por ID     |
| POST   | /orders     | Crear orden              |

**Ejemplo — Crear orden:**

```json
POST /orders
{
  "customerName": "Juan Pérez",
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

---

## Decisiones técnicas

**Monorepo**
Se optó por un monorepo para simplificar el desarrollo y la configuración inicial. Todos los servicios se encuentran en el mismo repositorio, facilitando el manejo del pipeline de CI/CD y la coherencia entre versiones.

**Database per Service**
Cada microservicio tiene su propia base de datos PostgreSQL. Esto evita el acoplamiento entre servicios a nivel de datos: si el esquema de productos cambia, no afecta directamente a órdenes.

**Comunicación HTTP REST**
Los servicios se comunican entre sí mediante HTTP REST usando `@nestjs/axios`. Se eligió sobre alternativas como RabbitMQ o Kafka por simplicidad en el contexto de una simulación local. En producción se recomendaría mensajería asíncrona para mayor resiliencia.

**TypeORM con synchronize**
Se usa `synchronize: true` en TypeORM para que las tablas se creen automáticamente en base a las entidades. Esta configuración es exclusiva para desarrollo; en producción se reemplazaría por migraciones explícitas.

**API Gateway como proxy**
El API Gateway no contiene lógica de negocio. Su único rol es recibir peticiones del cliente y redirigirlas al microservicio correspondiente, ocultando la topología interna del sistema al consumidor.

**Convención de commits**
El pipeline de CI/CD usa los mensajes de commit para determinar el tipo de versión automáticamente:

| Prefijo  | Ejemplo                             | Resultado |
|----------|-------------------------------------|-----------|
| `fix:`   | `fix: correct price validation`     | patch     |
| `feat:`  | `feat: add product search`          | minor     |
| `feat!:` | `feat!: remove deprecated endpoint` | major     |

---

## CI/CD

El pipeline de GitHub Actions para `products-service` se ejecuta en cada push a `main` que incluya cambios en `products-service/**` y realiza tres etapas:

1. **Build** — instala dependencias y compila TypeScript
2. **Version** — incrementa la versión automáticamente y genera `CHANGELOG.md`
3. **Deploy simulation** — construye la imagen Docker y simula el despliegue