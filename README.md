# WooCommerce Playground Blueprint Worker

This Cloudflare Worker serves as a dynamic blueprint generator for testing WooCommerce releases in WordPress Playground. It provides a JSON configuration that automatically installs and configures WooCommerce with predefined settings.

## Purpose

The worker is designed to work with WordPress Playground (https://playground.wordpress.net) to create reproducible WooCommerce testing environments. It generates a blueprint that:

- Installs a specified WooCommerce release
- Configures pretty permalinks
- Sets up basic store information
- Skips the onboarding wizard
- Configures basic WooCommerce settings
- Installs WC Smooth Generator
- Generates products and categories
- Can conditionally generate demo orders

## Usage

### Default

WooCommerce with the latest release:

```txt
https://playground.wordpress.net/?blueprint-url=https://woocommerce-worker.briancoords-com.workers.dev
```

### Custom release

To test a specific WooCommerce release:

```
https://playground.wordpress.net/?blueprint-url=https://woocommerce-worker.briancoords-com.workers.dev/?release=9.8.0-beta.1
```

Replace `9.8.0-beta.1` with any WooCommerce version you want to test. The release must match the tag on Github and also accepts `nightly`.

### Demo Customers and Orders

Pass `orders=X` to generate orders and customers in the backend for richer demo data. Example:

```
https://playground.wordpress.net/?blueprint-url=https://woocommerce-worker.briancoords-com.workers.dev/?orders=50
```

### Direct JSON Access

You can also access the JSON blueprint directly:

```txt
https://woocommerce-worker.briancoords-com.workers.dev/?release=9.8.0-beta.1
```

## Deployment

Automatically deploys on PR merge.

## Blueprint Configuration

The blueprint configures the following:

- **Store Location**: Los Angeles
- **Currency**: USD
- **Measurement Units**:
  - Weight: Pounds (lbs)
  - Dimensions: Inches (in)
- **Payment Methods**: Check payments enabled
- **Tracking**: Disabled
- **Onboarding**: Skipped for faster testing

## Development

The worker consists of two main files:

- `worker.js`: Contains the main logic and blueprint template
- `wrangler.toml`: Cloudflare Worker configuration

To modify the blueprint, edit the template object in `worker.js`.

## Contributing

Feel free to submit issues and enhancement requests!

### Running Locally

To run the worker locally for development and testing:

1. Install dependencies (if any):

```bash
npm install
```

2. Start the local development server:

```bash
wrangler dev
```

3. The worker will be available at a local address (usually `http://localhost:8787`). You can use this URL as your `blueprint-url` in WordPress Playground for local testing (ex: `https://playground.wordpress.net/?blueprint-url=http://localhost:8787`)

Refer to the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) for more details.
