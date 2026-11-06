
package com.shopkart.payment;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final String keySecret;
    private final String keyId;

    public RazorpayService(
            RazorpayClient razorpayClient,
            @Value("${razorpay.key-id}") String keyId,
            @Value("${razorpay.key-secret}") String keySecret) {

        this.razorpayClient = razorpayClient;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    public JSONObject createOrder(BigDecimal amountInRupees)
            throws RazorpayException {

        if (amountInRupees == null
                || amountInRupees.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero."
            );
        }

        // Convert rupees to paise without rounding silently.
        long amountPaise = amountInRupees
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.UNNECESSARY)
                .longValueExact();

        JSONObject options = new JSONObject();
        options.put("amount", amountPaise);
        options.put("currency", "INR");
        options.put(
                "receipt",
                "shopkart_" + System.currentTimeMillis()
        );

        // Create Razorpay order.
        Order order = razorpayClient.orders.create(options);

        // Read SDK values as Object to avoid generic overload issues.
        Object orderIdValue = order.get("id");
        Object amountValue = order.get("amount");
        Object currencyValue = order.get("currency");

        if (orderIdValue == null
                || amountValue == null
                || currencyValue == null) {
            throw new RazorpayException(
                    "Razorpay returned incomplete order details."
            );
        }

        String orderId = orderIdValue.toString();
        long returnedAmount = Long.parseLong(amountValue.toString());
        String currency = currencyValue.toString();

        // Return details expected by the Angular frontend.
        JSONObject result = new JSONObject();
        result.put("keyId", keyId);
        result.put("orderId", orderId);
        result.put("amount", returnedAmount);
        result.put("currency", currency);

        return result;
    }

    public boolean verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        if (razorpayOrderId == null || razorpayOrderId.isBlank()
                || razorpayPaymentId == null || razorpayPaymentId.isBlank()
                || razorpaySignature == null || razorpaySignature.isBlank()) {
            return false;
        }

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", razorpayOrderId);
        attributes.put("razorpay_payment_id", razorpayPaymentId);
        attributes.put("razorpay_signature", razorpaySignature);

        try {
            Utils.verifyPaymentSignature(attributes, keySecret);
            return true;
        } catch (RazorpayException | IllegalArgumentException ex) {
            return false;
        }
    }
}
