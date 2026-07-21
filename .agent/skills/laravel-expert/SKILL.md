---
name: laravel-expert
description: Senior Laravel Engineer role for production-grade, maintainable, and idiomatic Laravel solutions.
risk: medium (Eloquent N+1 database queries, mass-assignment vulnerabilities, authorization bypasses)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Laravel Expert

> **One-liner:** Guidelines for writing idiomatic Laravel applications, structuring thin controllers, validating requests using FormRequests, resolving Eloquent N+1 query loops, and securing database transactions.

## When to Use

- When developing backend architectures, APIs, or database interactions using Laravel 10/11+.
- When implementing request validation schemas, authentication middleware, or model access policies.
- When refactoring legacy PHP codebases into structured MVC or Service-oriented Laravel patterns.

## Why This Exists

If a Laravel application places business calculations, request validation, and raw Eloquent queries directly inside Controller methods, the code becomes unmaintainable. Furthermore, fetching related models in loops without eager loading creates N+1 database queries, causing severe performance degradation. Enforcing FormRequests, Service boundaries, eager loading, and Policy gates protects database integrity and ensures high performance.

## ALWAYS DO THIS

- **Use FormRequest classes for validation** — Separate request validation logic into dedicated FormRequest classes instead of writing validation rules inside controllers.
- **Eager load Eloquent relations** — Prevent N+1 queries by using `with()` to load relational attributes when fetching lists of items.
- **Isolate business logic in Services** — Implement thin controllers that delegate complex calculations and model writes to Service classes.
- **Enforce route model binding** — Resolve database records automatically inside routing methods by typing Eloquent models in controller parameters.
- **Wrap database write operations in transactions** — Guard multi-row creations and updates inside `DB::transaction()` blocks to prevent partial database updates.

## NEVER DO THIS

- ❌ **DO NOT** execute Eloquent queries inside loops when fetching relational models. **Why fails:** Creates N+1 query loops (1 query for the parent records, plus 1 query per record to fetch the relation), leading to slow response times. **Instead:** Eager load the relation using `with()` (e.g. `User::with('posts')->get()`).
- ❌ **DO NOT** perform raw request validation checks directly inside controller methods. **Why fails:** Clutters controllers, duplicates validation rules across endpoints, and violates single responsibility rules. **Instead:** Validate requests using dedicated FormRequest classes.
- ❌ **DO NOT** use mass-assignment operations on models without defining strict `$fillable` fields or using `request()->validated()`. **Why fails:** Allows users to modify internal parameters (like `is_admin` or `balance`) by sending unexpected parameters in the request body. **Instead:** Define `$fillable` columns or use validated request parameters.
- ❌ **DO NOT** write business calculations or raw database transactions inside Blade view templates or routing files. **Why fails:** Blocks unit testing, couples business logic to the view engine, and results in unmaintainable code. **Instead:** Place business logic in Service classes and return data to the view via the Controller.

---

## Laravel Request Processing Cycle

Routing requests through distinct verification layers protects business logic and isolates errors:

```
[HTTP Request] ──> [FormRequest (Validation)] ──> [Controller (Route Binding)] ──> [Service Layer] ──> [API Resource]
```

---

## Examples

### ✅ Good — FormRequests, Eager Loading, Services, and Resource Transformers

#### 1. Form Request Validation (`app/Http/Requests/StoreProductRequest.php`)
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Enforce policy checks
        return $this->user()->can('create', Product::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:categories,id']
        ];
    }
}
```

#### 2. Service Layer (`app/Services/ProductService.php`)
```php
<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function createProduct(array $data): Product
    {
        // Execute database actions within transactions
        return DB::transaction(function () use ($data) {
            $product = Product::create($data);
            
            // Dispatch background jobs, write logs, or trigger events
            
            return $product;
        });
    }
}
```

#### 3. Controller Layer (`app/Http/Controllers/ProductController.php`)
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    // List all products while eager loading relations to avoid N+1 queries
    public function index(): AnonymousResourceCollection
    {
        $products = Product::with('category')->paginate(15);
        return ProductResource::collection($products);
    }

    // Use Route Model Binding to fetch products automatically by ID
    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        // Fetch only validated form request fields
        $product = $this->productService.createProduct($request->validated());
        return new ProductResource($product);
    }
}
```

Why this passes: Separates validation rules into a FormRequest, keeps controllers thin, uses Route Model Binding, eager loads the `category` relation to prevent N+1 queries, uses database transactions, and formats output using API Resources.

### ❌ Bad — Database Queries in Loop, Raw Validation in Controller, and Mass Assignment

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class UnsafeProductController extends Controller
{
    // ERROR 1: Direct, un-optimized database fetch inside index
    public function index()
    {
        $products = Product::all();
        
        // ERROR 2: Eloquent query in loop (N+1 query issue)
        foreach ($products as $product) {
            // Triggers a separate SQL query for every single loop iteration!
            $product->categoryName = $product->category->name; 
        }

        return response()->json($products);
    }

    public function store(Request $request)
    {
        // ERROR 3: Direct validation checks inside the Controller
        $request->validate([
            'name' => 'required',
            'price' => 'required'
        ]);

        // ERROR 4: Blind mass assignment using raw request inputs (security risk)
        $product = Product::create($request->all()); 

        return response()->json($product);
    }
}
```

Why this fails: Triggers N+1 database queries in a loop, writes validation checks inside controller methods, uses unsafe request parameters, and exposes the database to mass-assignment vulnerabilities.

---

## Failure Modes

- **The N+1 Database Crawl:** Fetching relational models in lists without using `with()`, which overloads database connection pools under high traffic.
- **The Mass Assignment Leak:** Updating models using `request()->all()`, allowing attackers to override columns like status or role.
- **The Unvalidated request:** Passing unvalidated inputs directly into model database calls, leading to database schema crashes.
- **Queue Worker Memory Leak:** Long-running `php artisan queue:work` mengakumulasi resource (singleton bindings, static state) → memory tumbuh hingga OOM kill. Mitigasi: `--max-jobs=1000` atau pakai Horizon dengan auto-restart.
- **Route Model Binding Race:** Pakai implicit binding (`Route::get('/post/{post}')`) tanpa transaction, dua request edit post sama → last-write-wins, lost update. Mitigasi: optimistic locking via `version` column.
- **Eager-Load Over-Fetch:** `with('comments.user.posts.tags')` di list endpoint → setiap row Postgres load semua chain → memory explode + slow. Mitigasi: `select` columns saja, gunakan `with(['rel:id,name'])`.

## Validation

Audit Laravel app terhadap N+1, mass assignment, validation, dan queue stability:

1. **Detect N+1 risk (controllers tanpa `with()` di list):**
   ```bash
   grep -rnE "::all\(\)|::get\(\)" app/Http/Controllers/ | grep -v "with("
   # expected: minimal. Setiap list endpoint dengan relasi wajib eager-load.
   ```
2. **Validasi pindah ke FormRequest:**
   ```bash
   grep -rnE "request\(\)->validate\(|\$request->validate\(" app/Http/Controllers/
   # expected: zero atau minimal. Validation belong di app/Http/Requests/.
   ```
3. **Detect `request()->all()` (mass assignment risk):**
   ```bash
   grep -rnE "request\(\)->all\(\)|\$request->all\(\)" app/Http/Controllers/
   # expected: zero matches. Pakai `->only([...])` atau `$request->validated()`.
   ```
4. **Queue worker punya max-jobs / Horizon configured:**
   ```bash
   cat config/horizon.php 2>/dev/null || grep -rE "max-jobs|maxJobs" .deploy/ scripts/ deploy/
   # expected: Horizon active atau worker invocation pakai `--max-jobs=N` (auto-restart prevention OOM).
   ```
5. **Run test suite:**
   ```bash
   php artisan test --parallel
   # expected: pass. Specifically feature test untuk authorization (Gate/Policy) tidak skip.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Laravel application:

> "Use the skill `laravel-expert`. Read `.agent/skills/laravel-expert/SKILL.md` before coding. Never write raw query validations inside controllers or execute Eloquent queries in loops. Always use FormRequest classes, implement eager loading with, and manage business logic via Service classes."

## Related

- [backend-architect](../backend-architect/SKILL.md) — Architectural pattern guidelines.
- [api-design-principles](../api-design-principles/SKILL.md) — REST API endpoints rules.
- [secrets-management](../secrets-management/SKILL.md) — Secure keys configurations.
