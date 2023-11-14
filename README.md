# Paronama

[![Tests](https://github.com/mateonunez/panorama/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mateonunez/panorama/actions/workflows/ci.yml)

## 🚀 Getting Started

> This repository is just for fun. Please don't use this in production.

## Benchmark

```bash
❯ npm run bench:node

> bench:node
> tsx ./src/bench.mts

cpu: Apple M1 Pro
runtime: node v20.8.1 (arm64-darwin)

benchmark                                 time (avg)             (min … max)       p75       p99      p995
---------------------------------------------------------------------------- -----------------------------
• short static - GET /user
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                      66.54 ns/iter  (60.24 ns … 190.32 ns)  67.04 ns 141.79 ns 161.75 ns
Hono TrieRouter                       215.55 ns/iter (206.72 ns … 276.29 ns) 216.84 ns 262.63 ns 273.33 ns
@medley/router                         95.97 ns/iter  (90.79 ns … 168.05 ns)  98.29 ns 110.49 ns 156.28 ns
find-my-way                            88.52 ns/iter  (80.81 ns … 110.63 ns)  91.25 ns 104.88 ns 106.92 ns
koa-tree-router                        80.98 ns/iter   (75.89 ns … 99.22 ns)  83.79 ns  92.27 ns     96 ns
trek-router                           109.44 ns/iter (103.45 ns … 135.21 ns) 111.64 ns 123.22 ns  124.6 ns
express (WARNING: includes handling)    1.06 µs/iter     (1.05 µs … 1.11 µs)   1.07 µs   1.11 µs   1.11 µs
koa-router                               440 ns/iter (433.48 ns … 470.75 ns)  440.2 ns 465.46 ns 470.75 ns
radix3                                 85.67 ns/iter   (79.6 ns … 136.27 ns)  87.93 ns 105.31 ns 112.62 ns
panorama                              574.07 ns/iter (554.92 ns … 659.09 ns) 576.93 ns 659.09 ns 659.09 ns

summary for short static - GET /user
  Hono RegExpRouter
   1.22x faster than koa-tree-router
   1.29x faster than radix3
   1.33x faster than find-my-way
   1.44x faster than @medley/router
   1.64x faster than trek-router
   3.24x faster than Hono TrieRouter
   6.61x faster than koa-router
   8.63x faster than panorama
   15.99x faster than express (WARNING: includes handling)

• static with same radix - GET /user/comments
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                      78.19 ns/iter   (73.66 ns … 96.71 ns)  82.17 ns  89.15 ns  90.11 ns
Hono TrieRouter                       251.27 ns/iter (240.25 ns … 270.02 ns) 252.36 ns 268.09 ns 268.49 ns
@medley/router                        146.08 ns/iter (139.68 ns … 167.28 ns) 149.78 ns 157.93 ns 161.99 ns
find-my-way                           157.67 ns/iter (149.55 ns … 171.04 ns) 160.97 ns  169.7 ns 170.63 ns
koa-tree-router                       121.23 ns/iter (113.66 ns … 140.35 ns) 124.59 ns 132.03 ns 135.52 ns
trek-router                           168.15 ns/iter  (159.3 ns … 186.15 ns) 171.27 ns 181.74 ns 184.55 ns
express (WARNING: includes handling)    1.11 µs/iter      (1.1 µs … 1.15 µs)   1.12 µs   1.15 µs   1.15 µs
koa-router                            455.39 ns/iter (447.27 ns … 481.87 ns) 456.25 ns 478.88 ns 481.87 ns
radix3                                  93.7 ns/iter  (88.32 ns … 113.88 ns)   97.5 ns 103.44 ns 110.52 ns
panorama                              635.86 ns/iter (617.44 ns … 893.51 ns) 637.33 ns 893.51 ns 893.51 ns

summary for static with same radix - GET /user/comments
  Hono RegExpRouter
   1.2x faster than radix3
   1.55x faster than koa-tree-router
   1.87x faster than @medley/router
   2.02x faster than find-my-way
   2.15x faster than trek-router
   3.21x faster than Hono TrieRouter
   5.82x faster than koa-router
   8.13x faster than panorama
   14.24x faster than express (WARNING: includes handling)

• dynamic route - GET /user/lookup/username/hey
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                      145.7 ns/iter (138.37 ns … 158.86 ns) 148.39 ns 156.21 ns 158.36 ns
Hono TrieRouter                       391.67 ns/iter (362.98 ns … 809.78 ns) 389.16 ns 771.54 ns 809.78 ns
@medley/router                        202.51 ns/iter (192.63 ns … 351.07 ns) 205.35 ns 229.45 ns 237.77 ns
find-my-way                           242.38 ns/iter  (228.2 ns … 264.68 ns) 249.39 ns 261.75 ns 263.56 ns
koa-tree-router                       180.86 ns/iter (165.56 ns … 206.73 ns) 185.24 ns 196.98 ns 197.19 ns
trek-router                           298.51 ns/iter (265.26 ns … 851.76 ns) 299.12 ns 678.12 ns 851.76 ns
express (WARNING: includes handling)    1.83 µs/iter     (1.75 µs … 1.97 µs)   1.83 µs   1.97 µs   1.97 µs
koa-router                            471.32 ns/iter  (453.4 ns … 529.69 ns) 474.53 ns 525.58 ns 529.69 ns
radix3                                421.78 ns/iter  (407.16 ns … 455.6 ns) 427.89 ns 454.62 ns  455.6 ns
panorama                              758.17 ns/iter   (679.69 ns … 1.61 µs) 737.16 ns   1.61 µs   1.61 µs

summary for dynamic route - GET /user/lookup/username/hey
  Hono RegExpRouter
   1.24x faster than koa-tree-router
   1.39x faster than @medley/router
   1.66x faster than find-my-way
   2.05x faster than trek-router
   2.69x faster than Hono TrieRouter
   2.89x faster than radix3
   3.23x faster than koa-router
   5.2x faster than panorama
   12.56x faster than express (WARNING: includes handling)

• mixed static dynamic - GET /event/abcd1234/comments
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                     148.02 ns/iter (139.11 ns … 280.45 ns) 151.66 ns 190.08 ns 221.55 ns
Hono TrieRouter                       407.86 ns/iter  (396.9 ns … 471.78 ns) 412.69 ns 436.63 ns 471.78 ns
@medley/router                        170.29 ns/iter (148.63 ns … 202.95 ns) 176.36 ns 197.46 ns 198.55 ns
find-my-way                           209.58 ns/iter (198.15 ns … 242.74 ns) 215.03 ns 237.38 ns 241.27 ns
koa-tree-router                       152.56 ns/iter  (140.46 ns … 195.8 ns) 156.91 ns 178.95 ns 183.28 ns
trek-router                           246.44 ns/iter (230.65 ns … 290.93 ns) 253.98 ns  277.8 ns 281.76 ns
express (WARNING: includes handling)    1.97 µs/iter     (1.89 µs … 2.28 µs)   1.98 µs   2.28 µs   2.28 µs
koa-router                            499.17 ns/iter (473.68 ns … 542.42 ns)  508.4 ns 537.86 ns 542.42 ns
radix3                                404.98 ns/iter (388.88 ns … 428.18 ns) 410.98 ns 422.97 ns 428.18 ns
panorama                               730.7 ns/iter   (668.41 ns … 1.83 µs) 728.76 ns   1.83 µs   1.83 µs

summary for mixed static dynamic - GET /event/abcd1234/comments
  Hono RegExpRouter
   1.03x faster than koa-tree-router
   1.15x faster than @medley/router
   1.42x faster than find-my-way
   1.66x faster than trek-router
   2.74x faster than radix3
   2.76x faster than Hono TrieRouter
   3.37x faster than koa-router
   4.94x faster than panorama
   13.32x faster than express (WARNING: includes handling)

• post - POST /event/abcd1234/comment
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                     136.61 ns/iter (127.65 ns … 162.55 ns) 142.64 ns 156.53 ns 160.72 ns
Hono TrieRouter                       418.45 ns/iter (402.88 ns … 467.76 ns) 425.62 ns 456.46 ns 467.76 ns
@medley/router                         165.9 ns/iter (150.04 ns … 379.45 ns) 167.65 ns 262.03 ns 307.88 ns
find-my-way                           208.58 ns/iter (195.84 ns … 362.84 ns)  214.2 ns 323.75 ns 329.98 ns
koa-tree-router                       145.35 ns/iter (130.99 ns … 241.59 ns) 149.62 ns  184.1 ns 188.24 ns
trek-router                           208.83 ns/iter (192.34 ns … 340.73 ns) 215.86 ns 240.22 ns 242.57 ns
express (WARNING: includes handling)    1.99 µs/iter     (1.93 µs … 2.08 µs)   2.02 µs   2.08 µs   2.08 µs
koa-router                            484.72 ns/iter (466.78 ns … 518.33 ns) 490.43 ns 514.47 ns 518.33 ns
radix3                                403.49 ns/iter  (385.78 ns … 447.2 ns) 409.11 ns 445.81 ns  447.2 ns
panorama                              685.32 ns/iter  (663.42 ns … 931.8 ns)  687.6 ns  931.8 ns  931.8 ns

summary for post - POST /event/abcd1234/comment
  Hono RegExpRouter
   1.06x faster than koa-tree-router
   1.21x faster than @medley/router
   1.53x faster than find-my-way
   1.53x faster than trek-router
   2.95x faster than radix3
   3.06x faster than Hono TrieRouter
   3.55x faster than koa-router
   5.02x faster than panorama
   14.54x faster than express (WARNING: includes handling)

• long static - GET /very/deeply/nested/route/hello/there
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                      86.97 ns/iter  (79.85 ns … 199.43 ns)  87.93 ns 117.09 ns 151.95 ns
Hono TrieRouter                       352.34 ns/iter (337.67 ns … 378.64 ns) 358.01 ns 378.64 ns 378.64 ns
@medley/router                        124.86 ns/iter (116.95 ns … 150.74 ns) 128.86 ns  144.1 ns 147.11 ns
find-my-way                           211.06 ns/iter  (200.7 ns … 241.44 ns) 216.44 ns 231.95 ns 233.75 ns
koa-tree-router                       121.91 ns/iter   (113.1 ns … 144.9 ns) 125.03 ns 139.85 ns 140.82 ns
trek-router                           142.23 ns/iter (131.32 ns … 167.95 ns) 145.98 ns  166.2 ns 166.65 ns
express (WARNING: includes handling)    1.45 µs/iter      (1.42 µs … 1.5 µs)   1.48 µs    1.5 µs    1.5 µs
koa-router                            480.32 ns/iter (445.43 ns … 600.94 ns) 493.58 ns 565.38 ns 600.94 ns
radix3                                 93.63 ns/iter  (86.71 ns … 128.02 ns)  95.07 ns 114.85 ns 118.68 ns
panorama                              625.85 ns/iter    (594 ns … 992.22 ns) 629.46 ns 992.22 ns 992.22 ns

summary for long static - GET /very/deeply/nested/route/hello/there
  Hono RegExpRouter
   1.08x faster than radix3
   1.4x faster than koa-tree-router
   1.44x faster than @medley/router
   1.64x faster than trek-router
   2.43x faster than find-my-way
   4.05x faster than Hono TrieRouter
   5.52x faster than koa-router
   7.2x faster than panorama
   16.73x faster than express (WARNING: includes handling)

• wildcard - GET /static/index.html
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                     155.42 ns/iter  (143.1 ns … 184.48 ns) 161.12 ns 180.11 ns 184.26 ns
Hono TrieRouter                        297.4 ns/iter (280.96 ns … 329.79 ns) 307.12 ns 325.06 ns 329.79 ns
@medley/router                        128.08 ns/iter (115.88 ns … 162.95 ns) 132.95 ns 157.04 ns 160.54 ns
find-my-way                           185.84 ns/iter (172.37 ns … 217.08 ns) 192.22 ns 212.17 ns 213.53 ns
koa-tree-router                       154.56 ns/iter  (144.36 ns … 236.2 ns) 158.75 ns 219.68 ns 227.44 ns
trek-router                           184.43 ns/iter (175.95 ns … 241.24 ns) 190.27 ns  207.9 ns 211.18 ns
express (WARNING: includes handling)    2.17 µs/iter     (2.11 µs … 2.23 µs)   2.19 µs   2.23 µs   2.23 µs
koa-router                            466.57 ns/iter (443.57 ns … 508.18 ns) 478.63 ns 506.48 ns 508.18 ns
radix3                                399.73 ns/iter  (379.43 ns … 440.9 ns) 407.33 ns 437.81 ns  440.9 ns
panorama                              548.74 ns/iter (529.64 ns … 711.27 ns) 550.77 ns 637.73 ns 711.27 ns

summary for wildcard - GET /static/index.html
  @medley/router
   1.21x faster than koa-tree-router
   1.21x faster than Hono RegExpRouter
   1.44x faster than trek-router
   1.45x faster than find-my-way
   2.32x faster than Hono TrieRouter
   3.12x faster than radix3
   3.64x faster than koa-router
   4.28x faster than panorama
   16.93x faster than express (WARNING: includes handling)

• all together
---------------------------------------------------------------------------- -----------------------------
Hono RegExpRouter                      416.2 ns/iter (403.47 ns … 431.68 ns) 420.13 ns 431.03 ns 431.68 ns
Hono TrieRouter                         2.02 µs/iter     (1.99 µs … 2.13 µs)   2.03 µs   2.13 µs   2.13 µs
@medley/router                        712.83 ns/iter (667.78 ns … 827.71 ns) 723.25 ns 827.71 ns 827.71 ns
find-my-way                              1.1 µs/iter     (1.06 µs … 1.24 µs)   1.12 µs   1.24 µs   1.24 µs
koa-tree-router                       648.13 ns/iter  (611.23 ns … 721.5 ns) 668.67 ns  721.5 ns  721.5 ns
trek-router                             1.01 µs/iter   (986.65 ns … 1.05 µs)   1.02 µs   1.05 µs   1.05 µs
express (WARNING: includes handling)   11.45 µs/iter  (10.67 µs … 219.42 µs)  11.38 µs  14.13 µs  15.21 µs
koa-router                              3.21 µs/iter     (3.08 µs … 3.34 µs)   3.28 µs   3.34 µs   3.34 µs
radix3                                  1.64 µs/iter     (1.59 µs … 1.72 µs)   1.65 µs   1.72 µs   1.72 µs
panorama                                4.58 µs/iter      (4.35 µs … 5.4 µs)   4.64 µs    5.4 µs    5.4 µs

summary for all together
  Hono RegExpRouter
   1.56x faster than koa-tree-router
   1.71x faster than @medley/router
   2.42x faster than trek-router
   2.65x faster than find-my-way
   3.94x faster than radix3
   4.86x faster than Hono TrieRouter
   7.72x faster than koa-router
   11.01x faster than panorama
   27.52x faster than express (WARNING: includes handling)
```

## ⚠️ Testing

```bash
npm test
```

## 📝 License

[MIT](/LICENSE)
