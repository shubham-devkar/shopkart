
package com.shopkart.payment;

import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    private static final Logger logger =
            LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayService razorpayService;

    public PaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreatePaymentRequest request) {

        try {
            if (request == null || request.getAmount() == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Payment amount is required.")
                );
            }

            JSONObject result =
                    razorpayService.createOrder(request.getAmount());

            return ResponseEntity.ok(result.toMap());

        } catch (RazorpayException ex) {
            logger.error(
                    "Razorpay order creation failed: {}",
                    ex.getMessage(),
                    ex
            );

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    Map.of(
                            "message",
                            "Unable to create Razorpay order. Check backend console."
                    )
            );

        } catch (ArithmeticException | IllegalArgumentException ex) {
            logger.warn("Invalid payment amount: {}", ex.getMessage());

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid payment amount.")
            );

        } catch (Exception ex) {
            logger.error("Unexpected error while creating payment order.", ex);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "Unexpected error while creating payment order.")
            );
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {

        try {
            boolean verified = razorpayService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (!verified) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "verified", false,
                                "message",
                                "Payment signature verification failed."
                        )
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "verified", true,
                            "message", "Payment signature verified."
                    )
            );

        } catch (IllegalArgumentException ex) {
            logger.warn("Invalid payment verification request: {}", ex.getMessage());

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "verified", false,
                            "message", "Invalid payment verification request."
                    )
            );

        } catch (Exception ex) {
            logger.error("Payment verification failed.", ex);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "verified", false,
                            "message", "Payment verification failed."
                    )
            );
        }
    }
}
