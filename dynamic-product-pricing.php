<?php
/**
 * Plugin Name: Dynamic Product Pricing
 * Plugin URI: qaziwebsitewala.com
 * Description: Display a custom product quantity widget with dynamic pricing using shortcode [dynamic_product_pricing product_id="123"]
 * Version: 1.0
 * Author: Hasan Alam Qazi
 * Author URI: qaziwebsitewala.com */

if (!defined('ABSPATH')) exit;

// Enqueue JS and CSS
function dpp_enqueue_scripts() {
    wp_enqueue_style('dpp-style', plugin_dir_url(__FILE__) . 'dpp-style.css');
    wp_enqueue_script('dpp-script', plugin_dir_url(__FILE__) . 'dpp-script.js', ['jquery'], false, true);
    wp_localize_script('dpp-script', 'my_theme_vars', array('svg_icon' => get_template_directory_uri() . '/assets/arrow-right.svg',));

    // Pass WooCommerce cart URL for redirect after add to cart
    wp_localize_script('dpp-script', 'dpp_vars', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'cart_url' => wc_get_cart_url(),
    ]);
	
	// Enqueue WooCommerce cart fragment script if not already loaded
    if (class_exists('WooCommerce')) {
        wp_enqueue_script('wc-cart-fragments');
    }

    wp_localize_script('dpp-script', 'dpp_vars', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'cart_url' => wc_get_cart_url(),
    ]);
}
add_action('wp_enqueue_scripts', 'dpp_enqueue_scripts');




// Shortcode handler
function dpp_shortcode($atts) {
    $atts = shortcode_atts([
        'product_id' => 0
    ], $atts, 'dynamic_product_pricing');

    $product_id = intval($atts['product_id']);
    if (!$product_id) return '<p><strong>No product ID provided.</strong></p>';

    $product = wc_get_product($product_id);
    if (!$product) return '<p><strong>Invalid product ID.</strong></p>';

    $price = $product->get_price();

    ob_start(); ?>
    <div class="dpp-widget" data-product-id="<?php echo esc_attr($product_id); ?>" data-price="<?php echo esc_attr($price); ?>">
	    <div class="dpp-price">Gesamt: <span class="dpp-total"><?php echo wc_price($price); ?></span></div>
		<div class="button-wrap">
        <div class="dpp-qty-wrap">
            <button class="dpp-minus">-</button>
            <input type="number" class="dpp-qty" value="1" min="1" />
            <button class="dpp-plus">+</button>
        </div>
<button class="dpp-add-to-cart">
    In den Warenkorb
    <span class="dpp-icon">
              
    </span>
</button>
		</div>

        <div class="dpp-message" style="margin-top:10px;"></div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('dynamic_product_pricing', 'dpp_shortcode');

// Handle AJAX Add to Cart
function dpp_ajax_add_to_cart() {
    $product_id = intval($_POST['product_id']);
    $quantity = intval($_POST['quantity']);

    if ($product_id && $quantity) {
        WC()->cart->add_to_cart($product_id, $quantity);
        wp_send_json_success(['message' => 'Zum Warenkorb hinzugefügt.']);
    } else {
        wp_send_json_error(['message' => 'Ungültige Produktdaten.']);
    }
}
add_action('wp_ajax_dpp_add_to_cart', 'dpp_ajax_add_to_cart');
add_action('wp_ajax_nopriv_dpp_add_to_cart', 'dpp_ajax_add_to_cart');


