// Template JSON stored as a constant
const template = {
  $schema: "https://playground.wordpress.net/blueprint-schema.json",
  landingPage: "/wp-admin/admin.php?page=wc-admin",
  login: true,
  features: { networking: true, intl: true },
  steps: [
    {
      step: "installPlugin",
      pluginData: {
        resource: "url",
        url: "https://github-proxy.com/proxy/?repo=woocommerce/woocommerce&release={release}&asset={asset}",
      },
    },
    {
      step: "installPlugin",
      pluginData: {
        resource: "url",
        url: "https://github-proxy.com/proxy/?repo=WordPress/gutenberg&release=latest&asset=gutenberg.zip",
      },
      options: {
        activate: true,
        targetFolderName: "gutenberg",
      },
    },
    {
      step: "installTheme",
      themeData: {
        resource: "url",
        url: "https://github-proxy.com/proxy/?repo=woocommerce/woo-themes&branch=trunk&directory=purple",
      },
    },
    {
      step: "writeFile",
      path: "/wordpress/wp-content/mu-plugins/rewrite.php",
      data: "<?php /* Use pretty permalinks */ add_action( 'after_setup_theme', function() { global $wp_rewrite; $wp_rewrite->set_permalink_structure('/%postname%/'); $wp_rewrite->flush_rules(); } );",
    },
    {
      step: "setSiteOptions",
      options: {
        blogname: "WooCommerce",
        woocommerce_store_city: "Los Angeles",
        woocommerce_store_address: "123 Main St",
        woocommerce_store_postcode: "90038",
        woocommerce_default_country: "United States",
        woocommerce_onboarding_profile: {
          skipped: true,
        },
        woocommerce_currency: "USD",
        woocommerce_weight_unit: "lbs",
        woocommerce_dimension_unit: "in",
        woocommerce_allow_tracking: "no",
        woocommerce_cheque_settings: {
          enabled: "yes",
        },
        woocommerce_coming_soon: "no",
      },
    },
    {
      step: "installPlugin",
      pluginData: {
        resource: "url",
        url: "https://github-proxy.com/proxy/?repo=woocommerce/wc-smooth-generator&release=latest&asset=wc-smooth-generator.zip",
      },
      options: {
        activate: true,
        targetFolderName: "wc-smooth-generator",
      },
    },
    {
      step: "wp-cli",
      command: "wp wc generate terms product_cat 10 --max-depth=2",
    },
    {
      step: "wp-cli",
      command: "wp wc generate products 20",
    },
  ],
};

export default {
  async fetch(request, env, ctx) {
    // Parse the URL to get the release parameter
    const url = new URL(request.url);
    const release = url.searchParams.get("release") || "latest";
    const orders = url.searchParams.get("orders")
      ? parseInt(url.searchParams.get("orders"))
      : 0;

    // Create a deep copy of the template
    const response = JSON.parse(JSON.stringify(template));

    if (orders) {
      response.steps.push({
        step: "wp-cli",
        command: `wp wc generate orders ${orders}`,
      });
    }

    // Update the release in the URL
    response.steps[0].pluginData.url = response.steps[0].pluginData.url.replace(
      "{release}",
      release
    );

    let asset = "woocommerce.zip";
    if (release === "nightly") {
      asset = "woocommerce-trunk-nightly.zip";
    }

    response.steps[0].pluginData.url = response.steps[0].pluginData.url.replace(
      "{asset}",
      asset
    );

    // Return the JSON with proper headers
    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};
