---
name: openapi-spec-generation
description: Generate and maintain OpenAPI 3.1 specifications from code, design-first specs, and validation patterns.
risk: medium (invalid spec syntax, missing security requirements, broken contract synchronization)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# OpenAPI Spec Generation

> **One-liner:** Guidelines for writing, validating, and maintaining OpenAPI 3.1 specifications, defining object schemas, and configuring security requirements.

## When to Use

- When documenting RESTful APIs using standard YAML or JSON templates.
- When generating client SDKs, mock servers, or test suites using OpenAPI schemas.
- When validating API implementation contracts against design definitions.

## Why This Exists

If OpenAPI specifications lack detail (such as parameter definitions, response schemas, or required properties), they become useless for generating client SDKs or testing contracts. Additionally, syntax errors in YAML files break developer portals and documentation engines (like Swagger UI or Redocly). Enforcing schema completeness, explicit type declarations, and automated syntax validation ensures that API contracts remain correct and readable.

## ALWAYS DO THIS

- **Use OpenAPI 3.1.0 specifications** — Standardize on the modern OpenAPI 3.1.0 structure (which aligns with JSON Schema draft 2020-12).
- **Define explicit type properties** — Declare data types (`string`, `integer`, `boolean`, `array`, `object`) and formats (e.g., `uuid`, `date-time`) for all schema properties.
- **Enforce required fields list** — Always include a `required` array in object schemas to identify mandatory request and response fields.
- **Configure global security schemes** — Define authentication requirements (such as `bearerAuth` or `apiKey`) in the `components/securitySchemes` section and apply them globally or per-route.
- **Validate specs automatically** — Run automated validation tools (such as Redocly CLI) to check for syntax issues before committing changes.

## NEVER DO THIS

- ❌ **DO NOT** document endpoint responses with empty or missing schemas (e.g., `schema: {}` or omitting the `content` type). **Why fails:** Client generators cannot infer the response structure, resulting in untyped (e.g., `any`) fields in generated SDKs and breaking type safety. **Instead:** Define the response schema explicitly under `content/application/json/schema`.
- ❌ **DO NOT** use inline object schemas for shared data structures across multiple paths. **Why fails:** Duplicating schemas increases the maintenance burden and leads to inconsistent API definitions when models change. **Instead:** Reference shared schemas from `components/schemas` using `$ref` pointers.
- ❌ **DO NOT** define path variables in route URLs (e.g. `/users/{userId}`) without matching parameter declarations in the `parameters` block. **Why fails:** Invalidates the OpenAPI specification, causing UI documentation engines and SDK generators to fail. **Instead:** Define path parameters in the parameters list with `in: path` and `required: true`.
- ❌ **DO NOT** hardcode host URLs directly inside paths. **Why fails:** Ties the documentation to a single environment, preventing testing across local, staging, and production servers. **Instead:** Define multiple server environments in the root `servers` array.

---

## OpenAPI Validation & Generation Loop

Validating specifications before writing code prevents contract drift:

```
[Design Spec (YAML)] ──> [Redocly Lint Check] ──> [Generate Client SDK] ──> [Implement API Endpoint]
```

---

## Examples

### ✅ Good — Complete OpenAPI 3.1.0 Schema Definition (YAML)

```yaml
openapi: 3.1.0
info:
  title: Elite Product API
  version: 1.0.0
  description: API for managing catalog products securely.
servers:
  - url: https://api.my-app.com/v1
    description: Production environment
  - url: http://localhost:3000/v1
    description: Local development environment
paths:
  /products/{id}:
    get:
      summary: Retrieve a single product
      description: Returns product details by ID.
      security:
        - bearerAuth: []
      parameters:
        # 1. Define matching path variables explicitly
        - name: id
          in: path
          required: true
          description: Unique product ID
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Product details successfully retrieved
          content:
            application/json:
              schema:
                # 2. Use schema reference to prevent duplication
                $ref: '#/components/schemas/Product'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '404':
          description: Product not found

components:
  securitySchemes:
    # 3. Configure Bearer Token security requirements
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  responses:
    UnauthorizedError:
      description: Authentication failed
      content:
        application/json:
          schema:
            type: object
            required:
              - success
              - error
            properties:
              success:
                type: boolean
                example: false
              error:
                type: object
                required:
                  - code
                  - message
                properties:
                  code:
                    type: string
                    example: UNAUTHORIZED
                  message:
                    type: string
                    example: Token missing or invalid.
  schemas:
    # 4. Define modular components and mark required parameters
    Product:
      type: object
      required:
        - id
        - name
        - price
      properties:
        id:
          type: string
          format: uuid
          example: d3b07384-d113-49c3-a558-9c34e6e28512
        name:
          type: string
          example: Premium Mechanical Keyboard
        price:
          type: number
          minimum: 0
          example: 129.99
```

Why this passes: Uses OpenAPI 3.1.0, separates development and production environments, defines path parameters clearly, references shared components with `$ref`, documents error responses, and specifies security parameters.

### ❌ Bad — Inline Duplications, Empty Schemas, and Missing Security Schemas

```yaml
# ERROR 1: Using outdated spec version
openapi: 3.0.0 
info:
  title: Unsafe Product API
  version: 1.0.0
paths:
  # ERROR 2: Path variables lack parameter definitions in parameters block
  /products/{id}:
    get:
      summary: Get Product
      responses:
        '200':
          description: OK
          # ERROR 3: Empty schema definition - client SDK generators will fail
          content:
            application/json:
              schema: {} 

        '401':
          description: Error
          content:
            application/json:
              schema:
                # ERROR 4: Duplicating error schemas inline instead of referencing components
                type: object
                properties:
                  error:
                    type: string

# ERROR 5: Missing components/securitySchemes section even though API uses tokens
```

Why this fails: Uses an outdated version of the spec, leaves path variables undocumented, defines empty response schemas, duplicates error schemas inline, and lacks security definitions.

---

## Failure Modes

- **The Missing Path Variable Crash:** Registering paths with parameters (e.g. `/items/{itemId}`) but omitting the `parameters` block, which breaks Swagger UI loaders.
- **The Untyped Client Field:** Writing responses as `schema: {}`, causing SDK code generators to output variables as `any` types.
- **The Localhost Deploy Lock:** Hardcoding a local server URL directly in the path strings, making testing in other environments difficult.
- **Spec vs Runtime Drift:** Endpoint dihapus di server tapi YAML masih punya entry, atau response field baru di server gak ditulis di spec → SDK client crash atau ignore field. Mitigasi: spec generation dari kode (e.g. NestJS Swagger module) atau contract test.
- **Missing Security Scheme di Operations:** Define `bearerAuth` di components tapi lupa attach ke `security:` per operation → docs nampak public, generate SDK tanpa Authorization header.
- **No Example Block per Response:** Schema valid tapi tanpa `example`/`examples` block → Swagger UI tampil generic placeholder, developer pakai SDK bingung shape data real.

## Validation

Audit OpenAPI spec terhadap drift, lint compliance, security, dan example coverage:

1. **Lint dengan Redocly (strict):**
   ```bash
   npx @redocly/cli lint openapi.yaml --max-problems=0
   # expected: zero error + zero warning. Lint pass = spec syntactically benar + best practice.
   ```
2. **Verify `$ref` targets resolve (tidak broken):**
   ```bash
   npx @redocly/cli bundle openapi.yaml -o /tmp/bundled.yaml && echo "OK" || echo "BROKEN REF"
   # expected: OK. Bundle gagal = $ref point ke component yang gak ada.
   ```
3. **Setiap operation punya `security:` block:**
   ```bash
   grep -B2 "operationId" openapi.yaml | grep -c "security:"
   op_count=$(grep -c "operationId:" openapi.yaml)
   # expected: count `security:` ≈ count `operationId:` (kecuali public/anonymous endpoint).
   ```
4. **Setiap response 2xx punya example:**
   ```bash
   grep -A5 "'200':" openapi.yaml | grep -c "example"
   # expected: ≥ jumlah response 200. Tanpa example, SDK generator output `any`.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mendokumentasikan API menggunakan OpenAPI:

> "Use the skill `openapi-spec-generation`. Read `.agent/skills/openapi-spec-generation/SKILL.md` before coding. Never write empty response schemas or duplicate object schemas inline. Always use version 3.1.0, reference components using $ref, document path parameters, and lint the spec file before committing."

## Related

- [api-design-principles](../api-design-principles/SKILL.md) — REST endpoints layout rules.
- [api-patterns](../api-patterns/SKILL.md) — Envelope configurations.
- [env-fortress](../env-fortress/SKILL.md) — Environment variables setup.
