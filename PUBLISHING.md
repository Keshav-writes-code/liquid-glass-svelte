# Publishing Guide

This guide explains how to publish `@keshav-writes-code/liquid-glass-svelte` to NPM.

## Prerequisites

1.  **NPM Account**: You need an account on [npmjs.com](https://www.npmjs.com/).
2.  **Organization**: If publishing under a scope (e.g., `@keshav-writes-code`), ensure the organization exists or is your user scope.

## Manual Publishing

1.  **Login to NPM**:
    ```bash
    npm login
    ```
    Follow the prompts to authenticate via the browser.

2.  **Install & Build**:
    Ensure dependencies are installed and the package is built.
    ```bash
    npm install
    npm run build
    ```
    This generates the `dist` folder containing the package code.

3.  **Publish**:
    Since this is a scoped package, you must specify public access (configured in package.json, but good to know):
    ```bash
    npm publish ./dist --access public
    ```

## Automated Publishing (GitHub Actions)

This repository includes a GitHub Action (`.github/workflows/publish.yml`) that automatically publishes the package when a new Release is created on GitHub.

### Setup

1.  **Generate NPM Token**:
    -   Go to [npm tokens page](https://www.npmjs.com/settings/tokens).
    -   Generate a new **Automation** token.
    -   Copy the token string.

2.  **Add Secret to GitHub**:
    -   Go to your GitHub repository settings -> **Secrets and variables** -> **Actions**.
    -   Click **New repository secret**.
    -   Name: `NPM_TOKEN`
    -   Value: (Paste your NPM token)
    -   Click **Add secret**.

### Triggering a Release

1.  Update the `version` in `package.json` locally.
2.  Commit and push changes.
3.  Go to the **Releases** section on GitHub.
4.  Draft a new release.
5.  Tag the release (e.g., `v1.0.1`).
6.  Publish the release.
7.  The Action will run, build the project, and publish it to NPM.
