# Kretch

View the app at https://kretch.jennybelanger.com/

## Development

### Requirements

- [Git](https://git-scm.com/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Setup

First, setup the [Kretch API](https://github.com/jlbelanger/kretch-api).

``` bash
# Clone the app repo
git clone https://github.com/jlbelanger/kretch-app.git
cd kretch-app

# Configure the environment settings
cp .env.example .env
cp .env.example .env.production

# Install dependencies
yarn install
```

### Run

``` bash
yarn start
```

Your browser should automatically open http://localhost:3000/

### Lint

``` bash
yarn lint
```

### Test

``` bash
yarn test:cypress
```

## Deployment

Note: The deploy script included in this repo depends on other scripts that only exist in my private repos. If you want to deploy this repo, you'll have to create your own script.

``` bash
./deploy.sh
```
