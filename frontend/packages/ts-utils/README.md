# @munu/ts-utils

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/belgattitude/nextjs-monorepo-example/ci-packages.yml?style=for-the-badge&label=CI)

> **Note**
> This package is part of [belgattitude/nextjs-monorepo-example](https://github.com/belgattitude/nextjs-monorepo-example).

A package holding some basic typescript utilities: typeguards, assertions...

- [x] Packaged as ES module (type: module in package.json).
- [x] Can be build with tsup (no need if using tsconfig aliases).
- [x] Simple unit tests demo with either Vitest (`yarn test-unit`) or TS-Jest (`yarn test-unit-jest`).

## Install

From any package or apps:

```bash
yarn add @munu/ts-utils@"workspace:^"
```

## Enable aliases

```json5
{
  //"extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@munu/ts-utils": ["../../../packages/ts-utils/src/index"],
    },
  },
}
```

## Consume

```typescript
import { isPlainObject } from "@munu/ts-utils";

isPlainObject(true) === false;
```
