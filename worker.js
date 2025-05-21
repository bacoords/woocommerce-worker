// Template JSON stored as a constant
const template = {
  landingPage: "/wp-admin/admin.php?page=wc-admin",
  login: true,
  features: { networking: true },
  steps: [
    {
      step: "installPlugin",
      pluginData: {
        resource: "url",
        url: "https://github-proxy.com/proxy/?repo=woocommerce/woocommerce&release={release}&asset={asset}",
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
      },
    },
    {
      step: "importWxr",
      file: {
        resource: "url",
        url: "https://raw.githubusercontent.com/woocommerce/woocommerce/refs/heads/trunk/plugins/woocommerce/sample-data/sample_products.xml",
      },
    },
  ],
};

export default {
  async fetch(request, env, ctx) {
    // Parse the URL to get the release parameter
    const url = new URL(request.url);
    const release = url.searchParams.get("release") || "latest";
    const smoothGen = url.searchParams.get("smooth-generator") || "false";

    // Create a deep copy of the template
    const response = JSON.parse(JSON.stringify(template));

    // Update the release in the URL
    response.steps[0].pluginData.url = response.steps[0].pluginData.url.replace(
      "{release}",
      release
    );

    if ( smoothGen === "true" ) {
      // Add smooth generator plugin install as second step
      response.steps.splice(1, 0, {
        step: "installPlugin",
        pluginData: {
          resource: "url",
          url: "https://github-proxy.com/proxy/?repo=woocommerce/wc-smooth-generator&release=latest&asset=wc-smooth-generator.zip",
        },
      });

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
