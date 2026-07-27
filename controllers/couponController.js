const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.validateCoupon = async (req, res) => {
  try {
    const { code, cart_total } = req.body;

    if (!code || !cart_total) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and cart total are required'
      });
    }

    // Find coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if active
    if (!coupon.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active'
      });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check max uses
    if (coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Check minimum order amount
    if (cart_total < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required`
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
      discount_amount = (cart_total * coupon.discount_value) / 100;
    } else {
      discount_amount = coupon.discount_value;
    }

    // Cap discount at cart total
    discount_amount = Math.min(discount_amount, cart_total);
    const final_amount = cart_total - discount_amount;

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount_amount),
        final_amount: Math.round(final_amount),
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.incrementCouponUsage = async (code) => {
  await supabase
    .from('coupons')
    .update({ used_count: supabase.rpc('increment', { count: 1 }) })
    .eq('code', code.toUpperCase());
};