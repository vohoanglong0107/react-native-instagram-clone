# App source code <!-- omit in toc -->
This documents take you a tour around the app code base

## Contents of this Document <!-- omit in toc -->

- [Source code structures](#source-code-structures)
  - [actions](#actions)
- [assets](#assets)
- [components](#components)
- [constants](#constants)
- [hooks](#hooks)
- [navigations](#navigations)
- [reducers](#reducers)
- [screens](#screens)

## Source code structures

    .
    ├── actions
    ├── assets
    ├── components
    ├── constants
    ├── hooks
    ├── navigations
    ├── reducers
    ├── screens
    ├── utils
    ├── store.ts
    └── docs.md

### actions
This module consists of several actions used to modified global state of the app. More details [here](./actions/README.md)

## assets
This folder hold the app images and icons.

## components
Reusable component thorough the app UI is placed here.

## constants
Places app constant variable here, like **APP_NAME**, **DEFAULT_PHOTO_URI**, **FIREBASE_DATABASE_URL**, ...

## hooks
Custom hooks, used for:
- Get current keyboard status
- Get suggestion list for discovering user

## navigations
Consist of app navigation route, which is self explanatory.

## reducers
Reducerssssssssssssssssssssssssssss

## screens
See visual UI [here](./screens/README.md)


