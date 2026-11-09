package com.shopkart.service;

import com.shopkart.entity.OrderItem;
import com.shopkart.entity.ShopOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient = RestClient.create();

    @Value("${mailjet.api-key}")
    private String apiKey;

    @Value("${mailjet.secret-key}")
    private String secretKey;

    @Value("${mailjet.from-email}")
    private String fromEmail;

    public void sendOrderConfirmation(ShopOrder order) {

        StringBuilder body = new StringBuilder();

        body.append("Dear ")
                .append(order.getCustomerName())
                .append(",\n\n");

        body.append("GREAT NEWS! YOUR ORDER IS CONFIRMED!\n");
        body.append("==================================================\n\n");
        body.append("Thank you for choosing ShopKart!\n\n");

        body.append("ORDER INFORMATION\n");
        body.append("--------------------------------------------------\n");
        body.append("Order ID       : ")
                .append(order.getId()).append("\n");

        body.append("Order Status   : ")
                .append(order.getStatus()).append("\n");

        body.append("Payment Method : ")
                .append(order.getPaymentMethod()).append("\n\n");

        body.append("YOUR ORDER SUMMARY\n");
        body.append("--------------------------------------------------\n");

        for (OrderItem item : order.getItems()) {

            body.append("Product Name : ")
                    .append(item.getProductName()).append("\n");

            body.append("Quantity     : ")
                    .append(item.getQuantity()).append("\n");

            body.append("Subtotal     : Rs. ")
                    .append(item.getSubtotal()).append("\n");

            body.append("--------------------------------------------------\n");
        }

        body.append("\nTOTAL AMOUNT: Rs. ")
                .append(order.getTotalAmount()).append("\n\n");

        body.append("Your order is now being processed.\n");
        body.append("Thank you for shopping with ShopKart!\n\n");
        body.append("Warm Regards,\n");
        body.append("ShopKart Customer Support Team\n\n");
        body.append("This is an automatically generated email.");

        try {

            Map<String, Object> payload = Map.of(
                    "Messages", List.of(
                            Map.of(
                                    "From", Map.of(
                                            "Email", fromEmail,
                                            "Name", "ShopKart"
                                    ),
                                    "To", List.of(
                                            Map.of(
                                                    "Email", order.getCustomerEmail(),
                                                    "Name", order.getCustomerName()
                                            )
                                    ),
                                    "Subject",
                                    "ShopKart | Your Order Has Been Confirmed!",
                                    "TextPart",
                                    body.toString()
                            )
                    )
            );

            Map<?, ?> response = restClient.post()
                    .uri("https://api.mailjet.com/v3.1/send")
                    .headers(headers ->
                            headers.setBasicAuth(apiKey, secretKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            if (response == null
                    || !(response.get("Messages") instanceof List<?> messages)
                    || messages.isEmpty()
                    || !(messages.get(0) instanceof Map<?, ?> result)
                    || !"success".equalsIgnoreCase(
                    String.valueOf(result.get("Status")))) {

                log.error(
                        "Mailjet did not confirm order email delivery request."
                );
                return;
            }

            log.info(
                    "Order confirmation email accepted by Mailjet for order ID: {}",
                    order.getId()
            );

        } catch (Exception e) {

            log.error(
                    "Unable to send order confirmation email for order ID: {}",
                    order.getId(),
                    e
            );
        }
    }
}