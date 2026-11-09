# Competency matrix: Senior Full Stack Engineer

This file is the source of the study map. `pnpm content:matrix` turns it into the content packs in `content/packs/`: every filled cell (row × level) becomes one topic, and the cell text becomes the topic summary. CI fails if the packs are out of date with this file.

**How to edit**

- `` ## Pack title (`pack-id`) `` starts a content pack. `` ### Category title (`category-id`) `` starts a category inside it. Categories appear in the app in the order of this file.
- Each table row is one subject: `` | Title (`row-id`) | Junior | Mid | Senior | ``. Leave a cell empty or write `—` when a level does not apply. Do not use `|` inside a cell.
- Topic ids are `<category-id>.<row-id>.<level>`, e.g. `react.hooks.mid`. Exercises reference them, so rename a row id only together with its exercises.
- Each level automatically requires the previous level of the same row.
- Resources go under the table, one line per row: `` - `row-id`: [Title](https://...), [Title](https://...) ``. They apply to every level of that row.
- Write Romanian with comma-below ș and ț (never cedilla ş/ţ).

Exercises are not part of the matrix. They live in the pack JSON files and are kept when the packs are regenerated. Changing a pack's categories or topics bumps its minor version.

## Frontend: React, Next.js și Angular (`fullstack-frontend`)

### React + Next.js (`react`)

| Subiect                                | Junior                                                                                             | Mid                                                                                                                                        | Senior                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Componente și JSX (`components`)       | Scrii componente funcționale cu props, randare condiționată și liste cu `key` stabil.              | Compui componente reutilizabile (children, compound components, controlled vs uncontrolled) și știi unde să ridici state-ul.               | Proiectezi API-ul componentelor unui design system: compoziție în loc de configurare, accesibilitate, versionare și breaking changes.                       |
| Hooks și efecte (`hooks`)              | Folosești `useState` și `useEffect` respectând regulile hooks și array-ul de dependențe.           | Scrii custom hooks, elimini efectele inutile (date derivate, handler-e de evenimente) și faci cleanup corect, inclusiv la race conditions. | Explici modelul de randare și closure-urile stale, alegi între `useEffect`, `useLayoutEffect` și `useSyncExternalStore` și revizuiești hooks-urile echipei. |
| State management (`state`)             | Gestionezi state local și îl transmiți prin props sau Context.                                     | Separi server state (TanStack Query, RTK Query) de client state și normalizezi datele în Redux Toolkit sau Zustand.                        | Alegi arhitectura de state pentru o aplicație mare: granițe între feature-uri, selectori memoizați, sincronizare cu URL-ul și costul re-randărilor.         |
| Performanță (`performance`)            | Știi ce declanșează o re-randare și o observi în React DevTools.                                   | Măsori cu Profiler-ul și aplici `memo`, `useMemo`, `useCallback` și virtualizarea listelor doar unde contează.                             | Optimizezi Core Web Vitals (LCP, INP, CLS), code splitting și dimensiunea bundle-ului și folosești concurrent features (`useTransition`, Suspense).         |
| Next.js: randare și routing (`nextjs`) | Creezi pagini și layout-uri cu App Router și explici diferența dintre server și client components. | Alegi între SSR, SSG, ISR și streaming, folosești Server Actions și controlezi cache-ul pentru `fetch`.                                    | Proiectezi strategia de randare și caching (revalidare, edge vs Node runtime) și explici compromisurile React Server Components.                            |
| Testare (`testing`)                    | Scrii teste cu React Testing Library care caută elementele după rol și text.                       | Testezi hooks și stări asincrone și simulezi rețeaua cu MSW.                                                                               | Definești strategia de testare a frontend-ului (unit, integrare, e2e cu Playwright) și elimini testele fragile, legate de implementare.                     |

- `components`: [React: Describing the UI](https://react.dev/learn/describing-the-ui)
- `hooks`: [React: Built-in Hooks](https://react.dev/reference/react/hooks), [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- `state`: [React: Managing State](https://react.dev/learn/managing-state), [Redux Toolkit](https://redux-toolkit.js.org/)
- `performance`: [web.dev: Web Vitals](https://web.dev/articles/vitals)
- `nextjs`: [Next.js Docs](https://nextjs.org/docs)
- `testing`: [Testing Library: Guiding Principles](https://testing-library.com/docs/guiding-principles), [Mock Service Worker](https://mswjs.io/docs/)

### Angular (`angular`)

| Subiect                                         | Junior                                                                                   | Mid                                                                                                           | Senior                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Componente și template-uri (`components`)       | Scrii componente standalone cu inputs, outputs, binding și control flow (`@if`, `@for`). | Folosești content projection, lifecycle hooks și organizezi feature-urile cu rute lazy-loaded.                | Proiectezi biblioteci de componente reutilizabile și migrezi aplicații vechi de la NgModules la standalone.                    |
| Dependency injection (`di`)                     | Creezi servicii injectabile și le folosești în componente.                               | Folosești provideri la nivel de rută și de componentă, injection tokens și funcția `inject()`.                | Explici ierarhia de injectori și o folosești pentru arhitectură modulară și testabilitate.                                     |
| RxJS și signals (`reactivity`)                  | Te abonezi la Observables și folosești pipe-ul `async` ca să eviți memory leaks.         | Combini fluxuri cu `switchMap`, `mergeMap` și `combineLatest` și folosești signals cu `computed` și `effect`. | Alegi între signals și RxJS pentru fiecare caz, gestionezi interoperabilitatea lor și state-ul global (NgRx sau signal store). |
| Formulare (`forms`)                             | Construiești formulare reactive cu validatori built-in.                                  | Scrii validatori custom, inclusiv asincroni, și formulare dinamice.                                           | Proiectezi formulare complexe, typed și reutilizabile, cu mesaje de validare accesibile.                                       |
| Change detection și performanță (`performance`) | Explici când rulează change detection.                                                   | Folosești `OnPush`, `track` în `@for` și deferrable views (`@defer`).                                         | Treci la zoneless change detection, optimizezi SSR și hydration și analizezi bundle-ul.                                        |
| Testare (`testing`)                             | Scrii teste de componentă cu TestBed.                                                    | Simulezi servicii și HTTP cu `HttpTestingController` și testezi cod asincron.                                 | Definești strategia de testare și alegi între component harnesses, teste de integrare și e2e.                                  |

- `components`: [Angular: Components](https://angular.dev/guide/components)
- `di`: [Angular: Dependency injection](https://angular.dev/guide/di)
- `reactivity`: [Angular: Signals](https://angular.dev/guide/signals), [RxJS: Overview](https://rxjs.dev/guide/overview)
- `forms`: [Angular: Forms](https://angular.dev/guide/forms)
- `testing`: [Angular: Testing](https://angular.dev/guide/testing)

## Mobile: React Native (`fullstack-mobile`)

### React Native (`react-native`)

| Subiect                             | Junior                                                                          | Mid                                                                                                        | Senior                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Componente și layout (`components`) | Construiești ecrane cu componentele de bază și layout cu Flexbox.               | Creezi componente reutilizabile cu theming, safe areas și suport pentru dimensiuni diferite de ecran.      | Construiești un design system cross-platform și accesibil (TalkBack, VoiceOver), cu design tokens și diferențe de platformă controlate. |
| Navigare (`navigation`)             | Folosești stack și tab navigators din React Navigation.                         | Tipizezi rutele și configurezi deep linking și fluxul de autentificare.                                    | Proiectezi navigarea unei aplicații mari, inclusiv restaurarea stării și link-urile din notificări.                                     |
| Arhitectură și cod nativ (`native`) | Explici diferența dintre JS thread și UI thread și instalezi biblioteci native. | Configurezi build-ul Android și iOS (Gradle, CocoaPods, variante de build) și scrii un modul nativ simplu. | Explici New Architecture (JSI, TurboModules, Fabric), scrii module native performante și conduci upgrade-urile de React Native.         |
| Performanță (`performance`)         | Folosești `FlatList` în locul unui `ScrollView` pentru liste lungi.             | Profilezi cu React Native DevTools, folosești FlashList și elimini re-randările inutile.                   | Optimizezi timpul de pornire, Hermes, memoria și animațiile pe UI thread (Reanimated) pentru telefoane mid-range.                       |
| Date offline și stocare (`offline`) | Salvezi preferințe în AsyncStorage.                                             | Folosești o bază de date locală (SQLite) cu migrații și sincronizezi datele cu un API.                     | Proiectezi o arhitectură offline-first, cu rezolvarea conflictelor și stocare securizată (Keychain, Keystore).                          |
| Release și calitate (`release`)     | Rulezi aplicația pe emulator și generezi un build de debug.                     | Semnezi build-uri de release, configurezi CI și raportarea crash-urilor.                                   | Gestionezi publicarea în magazine, OTA updates, feature flags și monitorizarea în producție.                                            |

- `components`: [React Native: Core Components](https://reactnative.dev/docs/components-and-apis)
- `navigation`: [React Navigation](https://reactnavigation.org/docs/getting-started)
- `native`: [React Native: Architecture](https://reactnative.dev/architecture/landing-page)
- `performance`: [React Native: Performance](https://reactnative.dev/docs/performance)
- `release`: [React Native: Publishing to Google Play](https://reactnative.dev/docs/signed-apk-android)

## Backend: Node.js și NestJS (`fullstack-backend-node`)

### NestJS (`nestjs`)

| Subiect                                  | Junior                                                                          | Mid                                                                                                            | Senior                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Module și provideri (`modules`)          | Creezi module, controllere și servicii și explici dependency injection în Nest. | Folosești provideri custom (`useFactory`, `useClass`), module dinamice și scope-uri de injecție.               | Structurezi o aplicație mare ca modular monolith, cu granițe clare între module de domeniu și fără dependențe circulare.             |
| Pipeline-ul cererii (`request-pipeline`) | Validezi input-ul cu DTO-uri, `ValidationPipe` și class-validator.              | Explici ordinea middleware → guards → interceptors → pipes → handler → exception filters și scrii fiecare tip. | Plasezi cross-cutting concerns (autorizare, logging, tracing, rate limiting) la nivelul potrivit al pipeline-ului.                   |
| Acces la date (`data`)                   | Faci operații CRUD cu un ORM (Prisma sau TypeORM).                              | Gestionezi tranzacții, relații și migrații și eviți problema N+1.                                              | Alegi pattern-uri de persistență (repository, unit of work), asiguri consistența între servicii (outbox) și optimizezi interogările. |
| Autentificare și securitate (`auth`)     | Implementezi login cu JWT folosind Passport.                                    | Implementezi refresh tokens, roluri și guards de autorizare și configurezi CORS și Helmet.                     | Proiectezi autentificarea și autorizarea (OAuth2, OIDC, RBAC vs ABAC) și revizuiești API-ul după OWASP API Security Top 10.          |
| Mesagerie și microservicii (`messaging`) | Folosești o coadă (BullMQ) pentru task-uri în background.                       | Folosești transporturile de microservicii din Nest și consumatori idempotenți, cu retry.                       | Proiectezi arhitecturi event-driven (Kafka, RabbitMQ) cu sagas, ordinea mesajelor și garanții de livrare.                            |
| Testare (`testing`)                      | Scrii unit tests pentru servicii cu `Test.createTestingModule`.                 | Scrii teste e2e cu Supertest și o bază de date reală (Testcontainers).                                         | Definești strategia de testare a backend-ului, inclusiv contract testing între servicii.                                             |

- `modules`: [NestJS: Modules](https://docs.nestjs.com/modules)
- `request-pipeline`: [NestJS: Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)
- `data`: [NestJS: Database](https://docs.nestjs.com/techniques/database)
- `auth`: [NestJS: Authentication](https://docs.nestjs.com/security/authentication), [OWASP API Security Top 10](https://owasp.org/API-Security/)
- `messaging`: [NestJS: Microservices](https://docs.nestjs.com/microservices/basics)
- `testing`: [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing)

## Backend: Java și Spring Boot (`fullstack-java`)

### Java și Spring Boot (`java-spring`)

| Subiect                                    | Junior                                                                                 | Mid                                                                                                           | Senior                                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Limbajul Java (`language`)                 | Folosești clase, interfețe, excepții și colecțiile standard.                           | Folosești generics, streams, `Optional` și records și explici contractul `equals`/`hashCode`.                 | Explici JVM-ul (memorie, garbage collection, JIT) și folosești funcțiile noi din versiunile LTS (sealed types, pattern matching). |
| Concurență (`concurrency`)                 | Explici ce sunt thread-urile și de ce apar race conditions.                            | Folosești `ExecutorService`, `CompletableFuture` și colecții concurente.                                      | Explici Java Memory Model (happens-before, `volatile`) și virtual threads și diagnostichezi deadlock-uri din thread dumps.        |
| Spring Boot (`spring-boot`)                | Creezi o aplicație Spring Boot cu beans injectate și configurare în `application.yml`. | Folosești profile și configuration properties și explici auto-configurarea și ciclul de viață al bean-urilor. | Explici proxy-urile Spring (AOP, `@Transactional`), scrii auto-configurări proprii și reduci timpul de pornire.                   |
| API-uri REST (`web`)                       | Expui endpoint-uri REST cu `@RestController` și validare.                              | Tratezi erorile centralizat (`@ControllerAdvice`), implementezi paginarea și documentezi API-ul cu OpenAPI.   | Alegi între Spring MVC și WebFlux și construiești clienți rezistenți (timeouts, retries, circuit breakers).                       |
| Persistență (`data`)                       | Folosești Spring Data JPA cu repository-uri.                                           | Gestionezi tranzacții, lazy loading și problema N+1 și scrii migrații cu Flyway.                              | Optimizezi Hibernate (fetch strategies, locking optimist, cache de nivel 2) și știi când JDBC simplu e mai potrivit.              |
| Testare și securitate (`testing-security`) | Scrii unit tests cu JUnit 5 și Mockito.                                                | Scrii teste de integrare cu `@SpringBootTest` și Testcontainers și configurezi Spring Security de bază.       | Configurezi Spring Security ca OAuth2 Resource Server și definești strategia de testare pe straturi.                              |

- `language`: [dev.java: Learn Java](https://dev.java/learn/)
- `concurrency`: [Java Tutorials: Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
- `spring-boot`: [Spring Boot Reference](https://docs.spring.io/spring-boot/index.html)
- `web`: [Spring Guide: Building a RESTful Web Service](https://spring.io/guides/gs/rest-service)
- `data`: [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/)
- `testing-security`: [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)

## Backend: Go (`fullstack-go`)

### Go (`go`)

| Subiect                          | Junior                                             | Mid                                                                                                                     | Senior                                                                                                                   |
| -------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Limbajul Go (`language`)         | Folosești tipuri, slices, maps, structs și metode. | Folosești interfețe implicite, embedding și generics și explici diferența dintre receiver prin valoare și prin pointer. | Scrii Go idiomatic, explici escape analysis și alocările și organizezi pachetele cu API-uri mici.                        |
| Gestionarea erorilor (`errors`)  | Verifici erorile returnate și le propagi.          | Folosești wrapping (`%w`), `errors.Is`, `errors.As` și tipuri de erori proprii.                                         | Definești convențiile de erori ale unui serviciu: sentinel vs tipizate, context util și logare o singură dată.           |
| Concurență (`concurrency`)       | Pornești goroutines și comunici prin channels.     | Folosești `select`, `sync.WaitGroup`, `sync.Mutex` și `context` pentru anulare și timeouts.                             | Proiectezi pipeline-uri concurente (worker pools, fan-out/fan-in), previi goroutine leaks și folosești race detector-ul. |
| Servicii HTTP (`http`)           | Scrii un server HTTP cu `net/http`.                | Folosești middleware, routing-ul din biblioteca standard, JSON și graceful shutdown.                                    | Construiești servicii de producție cu timeouts, observabilitate și gRPC și le profilezi cu pprof.                        |
| Date și testare (`data-testing`) | Scrii teste cu pachetul `testing`.                 | Scrii table-driven tests și benchmark-uri și accesezi PostgreSQL cu `database/sql` sau pgx.                             | Proiectezi cod testabil prin interfețe mici, cu teste de integrare și fuzzing.                                           |

- `language`: [A Tour of Go](https://go.dev/tour/), [Effective Go](https://go.dev/doc/effective_go)
- `errors`: [Go blog: Working with Errors](https://go.dev/blog/go1.13-errors)
- `concurrency`: [Go blog: Pipelines and cancellation](https://go.dev/blog/pipelines)
- `http`: [Package net/http](https://pkg.go.dev/net/http)
- `data-testing`: [Go: Add a test](https://go.dev/doc/tutorial/add-a-test)

## Baze de date: SQL și MongoDB (`fullstack-databases`)

### SQL și PostgreSQL (`sql`)

| Subiect                                   | Junior                                                       | Mid                                                                                                    | Senior                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Interogări (`queries`)                    | Scrii `SELECT` cu `WHERE`, `JOIN`, `GROUP BY` și `ORDER BY`. | Folosești subinterogări, CTE-uri și window functions și explici diferențele dintre tipurile de `JOIN`. | Scrii interogări corecte cu `NULL`, CTE-uri recursive și agregări avansate și le rescrii pentru performanță. |
| Modelare (`modeling`)                     | Creezi tabele cu chei primare și chei străine.               | Normalizezi până la 3NF și alegi constrângerile (`UNIQUE`, `CHECK`) și tipurile potrivite.             | Decizi când să denormalizezi, modelezi date multi-tenant sau temporale și planifici migrații fără downtime.  |
| Indecși și performanță (`performance`)    | Explici ce este un index și când ajută.                      | Citești `EXPLAIN ANALYZE` și alegi indecși compuși, parțiali sau acoperitori.                          | Diagnostichezi interogări lente în producție (`pg_stat_statements`, statistici, bloat, VACUUM).              |
| Tranzacții și concurență (`transactions`) | Folosești tranzacții pentru operații atomice.                | Explici ACID, nivelurile de izolare și anomaliile pe care le previn.                                   | Explici MVCC, alegi între locking optimist și pesimist și previi deadlock-urile.                             |
| Operare și scalare (`operations`)         | Faci backup și restore pentru o bază de date.                | Folosești connection pooling (PgBouncer) și replici de citire.                                         | Proiectezi replicare, partiționare și high availability, cu obiective clare de recuperare (RPO, RTO).        |

- `queries`: [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- `modeling`: [PostgreSQL: Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- `performance`: [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html), [Use The Index, Luke](https://use-the-index-luke.com/)
- `transactions`: [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- `operations`: [PostgreSQL: High Availability](https://www.postgresql.org/docs/current/high-availability.html)

### MongoDB (`mongodb`)

| Subiect                                | Junior                                                         | Mid                                                                                            | Senior                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Documente și CRUD (`crud`)             | Faci operații CRUD și interogări cu filtre și proiecții.       | Folosești operatori de update (`$set`, `$push`), upsert și operații bulk.                      | Explici garanțiile de scriere și citire (write concern, read concern, read preference).                                 |
| Modelarea datelor (`modeling`)         | Explici documentele și diferența față de tabelele relaționale. | Alegi între embedding și referencing după tiparele de acces.                                   | Aplici pattern-uri de schemă (bucket, computed, subset) și validarea schemei și eviți array-urile care cresc nelimitat. |
| Indecși și performanță (`performance`) | Creezi indecși simpli.                                         | Folosești indecși compuși după regula ESR, citești `explain()` și eviți scanările de colecție. | Optimizezi volume mari de date cu indecși parțiali, TTL, covered queries și profiler-ul.                                |
| Aggregation framework (`aggregation`)  | Folosești `$match`, `$group` și `$sort`.                       | Construiești pipeline-uri cu `$lookup`, `$unwind` și `$project`.                               | Optimizezi pipeline-urile (ordinea etapelor, folosirea indecșilor) și alegi între agregare la cerere și precalculare.   |
| Replicare și sharding (`scaling`)      | Explici ce este un replica set.                                | Folosești tranzacții multi-document și explici când sunt necesare.                             | Alegi shard key-ul, explici compromisurile de consistență și argumentezi când PostgreSQL e o alegere mai bună.          |

- `crud`: [MongoDB: CRUD Operations](https://www.mongodb.com/docs/manual/crud/)
- `modeling`: [MongoDB: Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- `performance`: [MongoDB: Indexes](https://www.mongodb.com/docs/manual/indexes/)
- `aggregation`: [MongoDB: Aggregation](https://www.mongodb.com/docs/manual/aggregation/)
- `scaling`: [MongoDB: Sharding](https://www.mongodb.com/docs/manual/sharding/)

## Fundamente, DevOps și soft skills (`fullstack-devops-soft`)

### Fundamente full stack (`fundamentals`)

| Subiect                          | Junior                                                                          | Mid                                                                                                                | Senior                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript (`javascript`)        | Folosești tipurile, funcțiile, metodele de array, `let`/`const` și modulele ES. | Explici closures, `this`, prototipurile, promisiunile și event loop-ul (microtasks vs macrotasks).                 | Explici gestionarea memoriei și garbage collection, diagnostichezi memory leaks și diferențele dintre runtimes (browser, Node.js). |
| TypeScript (`typescript`)        | Tipizezi funcții, obiecte și uniuni și lucrezi în modul `strict`.               | Folosești generics, narrowing, discriminated unions și utility types.                                              | Scrii tipuri avansate (conditional, mapped, template literal types) și contracte type-safe între frontend și backend.              |
| HTTP și web (`http`)             | Explici metodele HTTP, codurile de status și headerele uzuale.                  | Explici caching-ul HTTP (`Cache-Control`, ETag), CORS și cookies și diferențele dintre HTTP/1.1, HTTP/2 și HTTP/3. | Proiectezi strategii de caching (CDN, invalidare) și depanezi probleme de rețea, TLS și latență.                                   |
| Design de API-uri (`api-design`) | Proiectezi endpoint-uri REST cu resurse și metode HTTP corecte.                 | Rezolvi paginarea, versionarea, idempotența și formatul erorilor și cunoști GraphQL.                               | Alegi între REST, GraphQL și gRPC, proiectezi contracte care evoluează fără breaking changes și limitezi traficul (rate limiting). |
| Testare (`testing`)              | Scrii unit tests cu aserțiuni clare.                                            | Aplici piramida testării, folosești mocks cu măsură și scrii teste de integrare.                                   | Definești strategia de calitate a echipei: TDD unde merită, contract testing, teste e2e stabile și metrici utile.                  |
| Arhitectură (`architecture`)     | Scrii cod curat: nume clare, funcții mici, fără duplicare.                      | Aplici SOLID, design patterns uzuale și separarea pe straturi.                                                     | Alegi între monolit modular și microservicii, aplici DDD, documentezi deciziile (ADR) și explici compromisurile de system design.  |

- `javascript`: [MDN: JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- `typescript`: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- `http`: [MDN: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- `api-design`: [Google Cloud: API Design Guide](https://cloud.google.com/apis/design)
- `testing`: [Martin Fowler: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- `architecture`: [Martin Fowler: Software Architecture Guide](https://martinfowler.com/architecture/)

### DevOps, securitate și observabilitate (`devops`)

| Subiect                                 | Junior                                                                             | Mid                                                                                                                            | Senior                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Git și CI/CD (`ci-cd`)                  | Lucrezi cu branch-uri și pull requests și rezolvi conflicte.                       | Configurezi pipeline-uri CI (lint, teste, build) cu GitHub Actions.                                                            | Proiectezi livrarea continuă: trunk-based development, deployment blue-green sau canary, feature flags și rollback.               |
| Containere și Kubernetes (`containers`) | Scrii un Dockerfile și rulezi servicii cu Docker Compose.                          | Optimizezi imaginile (multi-stage, layere, utilizator non-root) și faci deploy pe Kubernetes (Deployment, Service, ConfigMap). | Configurezi resurse, autoscaling, probe și strategii de rollout și depanezi probleme din cluster.                                 |
| Cloud și infrastructură (`cloud`)       | Cunoști serviciile de bază din cloud: compute, storage și baze de date gestionate. | Descrii infrastructura ca cod (Terraform) și gestionezi medii separate și secrete.                                             | Proiectezi infrastructură scalabilă, rezistentă și eficientă ca cost, cu rețea și IAM configurate corect.                         |
| Securitate (`security`)                 | Cunoști OWASP Top 10 și nu pui niciodată secrete în cod.                           | Previi XSS, CSRF, SQL injection și SSRF, stochezi parolele corect și gestionezi sesiunile în siguranță.                        | Faci threat modeling, revizuiești autentificarea (OAuth2, OIDC), securizezi supply chain-ul și coordonezi răspunsul la incidente. |
| Observabilitate (`observability`)       | Scrii loguri utile, cu niveluri potrivite.                                         | Folosești logging structurat, metrici și tracing distribuit (OpenTelemetry) și construiești dashboard-uri.                     | Definești SLI, SLO și alerte, conduci investigarea incidentelor și postmortem-uri fără vinovați.                                  |

- `ci-cd`: [GitHub Actions](https://docs.github.com/en/actions)
- `containers`: [Docker: Get started](https://docs.docker.com/get-started/), [Kubernetes: Concepts](https://kubernetes.io/docs/concepts/)
- `cloud`: [Terraform Tutorials](https://developer.hashicorp.com/terraform/tutorials)
- `security`: [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- `observability`: [OpenTelemetry Docs](https://opentelemetry.io/docs/), [Google SRE Book: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)

### Soft skills (`soft-skills`)

| Subiect                                   | Junior                                                  | Mid                                                                                | Senior                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Comunicare (`communication`)              | Comunici clar progresul și ceri ajutor la timp.         | Explici decizii tehnice colegilor non-tehnici și scrii documentație utilă.         | Influențezi decizii fără autoritate formală, moderezi discuții dificile și scrii documente de design convingătoare.                   |
| Code review (`code-review`)               | Primești feedback la code review și îl aplici.          | Faci code review constructiv, concentrat pe corectitudine și lizibilitate.         | Stabilești standardele de review ale echipei și folosești review-ul ca instrument de mentorat.                                        |
| Ownership și livrare (`ownership`)        | Îți termini task-urile și semnalezi blocajele din timp. | Estimezi realist, împarți munca în pași livrabili și duci feature-urile cap-coadă. | Răspunzi de rezultate la nivel de produs, negociezi scope-ul și gestionezi riscurile și datoria tehnică.                              |
| Mentorat și leadership (`leadership`)     | Împărtășești cu echipa ce ai învățat.                   | Ghidezi colegii juniori prin pair programming și onboarding.                       | Mentorezi constant, ridici nivelul echipei și conduci inițiative tehnice între echipe.                                                |
| Interviuri comportamentale (`behavioral`) | Îți prezinți clar experiența și proiectele.             | Răspunzi cu metoda STAR, cu exemple concrete și rezultate măsurabile.              | Spui povești de impact la nivel senior: conflicte rezolvate, decizii greșite și ce ai învățat din ele, influență asupra arhitecturii. |

- `code-review`: [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/)
- `leadership`: [StaffEng: Guides](https://staffeng.com/guides/)
