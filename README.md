# figbird-issue

> issue repro

## About

This is a super simple repo to reproduce an issue with `figbird`.

## Expected

Query parameters in `useFind` should be separate, and have no effect on commands sent with `useMutation`.

## Actual

Using a query operator that is not in [this list](https://github.com/humaans/figbird/blob/e2114985a0158ffd352c9cecca8cf3d77b84015a/lib/filterQuery.js#L28) in a `useFind` query causes an `Invalid Query Parameter` error when using a `useMutation` method later


## To Reproduce

1. `yarn install`
2. `yarn start:dev`
3. Try to use the very search and create inputs.
4. See the errors in the console.