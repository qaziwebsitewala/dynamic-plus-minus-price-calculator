document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.dpp-widget').forEach(function (widget) {
        const price = parseFloat(widget.dataset.price);
        const productId = widget.dataset.productId;
        const qtyInput = widget.querySelector('.dpp-qty');
        const totalDisplay = widget.querySelector('.dpp-total');
        const messageBox = widget.querySelector('.dpp-message');

        function updatePrice() {
            const qty = parseInt(qtyInput.value) || 1;
            const total = (qty * price).toFixed(2);
            totalDisplay.innerText = '€' + total;
        }

        widget.querySelector('.dpp-plus').addEventListener('click', function () {
            qtyInput.value = parseInt(qtyInput.value) + 1;
            updatePrice();
        });

        widget.querySelector('.dpp-minus').addEventListener('click', function () {
            const current = parseInt(qtyInput.value);
            if (current > 1) {
                qtyInput.value = current - 1;
                updatePrice();
            }
        });

        qtyInput.addEventListener('input', updatePrice);

        widget.querySelector('.dpp-add-to-cart').addEventListener('click', function () {
            const quantity = parseInt(qtyInput.value) || 1;

            fetch(dpp_vars.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: new URLSearchParams({
                    action: 'dpp_add_to_cart',
                    product_id: productId,
                    quantity: quantity
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    messageBox.innerText = data.data.message;

                    // 🚀 Force WooCommerce to refresh cart fragments (cart count & mini cart)
                    jQuery(document.body).trigger('added_to_cart');
                } else {
                    messageBox.innerText = data.data.message;
                }
            })
            .catch(err => {
                messageBox.innerText = 'Ein Fehler ist aufgetreten.';
            });
        });

        updatePrice();
    });
});



jQuery(document).ready(function ($) {
  const originalSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="13" viewBox="0 0 16 13" fill="none">
      <path d="M9.19184 0.46875C9.19184 0.46875 12.0418 6.19875 15.9318 6.19875H0.0683594M9.19184 11.9388C9.19184 11.9388 12.0418 6.20875 15.9318 6.20875" stroke="#2F4F4F" stroke-width="1.5" stroke-miterlimit="10"></path>
    </svg>`;

  const hoverSVG = 
    `<img src="${my_theme_vars.svg_icon}" width="16" height="13" alt="arrow icon" />`;

  // Ensure icon span exists
  $('.dpp-add-to-cart').each(function () {
    let iconSpan = $(this).find('.dpp-icon');
    if (iconSpan.length === 0) {
      $(this).append('<span class="dpp-icon"></span>');
      iconSpan = $(this).find('.dpp-icon');
    }
    iconSpan.html(originalSVG);
  });

  // Hover effect
  $('.dpp-add-to-cart').hover(
    function () {
      $(this).find('.dpp-icon').fadeOut(100, function () {
        $(this).html(hoverSVG).fadeIn(100);
      });
    },
    function () {
      $(this).find('.dpp-icon').fadeOut(100, function () {
        $(this).html(originalSVG).fadeIn(100);
      });
    }
  );
});

jQuery(document).ready(function ($) {
  $('body').on('added_to_cart', function () {
    $.ajax({
      url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
      type: 'POST',
      success: function (response) {
        if (response && response.fragments) {
          $.each(response.fragments, function (key, value) {
            $(key).replaceWith(value);
          });
        }
      }
    });
  });
});
