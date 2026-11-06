
package com.shopkart.service;

import com.shopkart.entity.OrderItem;
import com.shopkart.entity.ShopOrder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(ShopOrder order) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(order.getCustomerEmail());

        message.setSubject("ShopKart | Your Order Has Been Confirmed!");

        StringBuilder body = new StringBuilder();

        body.append("Dear ")
                .append(order.getCustomerName())
                .append(",\n\n");

        body.append("GREAT NEWS! YOUR ORDER IS CONFIRMED!\n");
        body.append("==================================================\n\n");

        body.append("Thank you for choosing ShopKart!\n");
        body.append("We are delighted to inform you that your order ")
                .append("has been successfully placed.\n\n");

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

        body.append("\n");

        body.append("TOTAL AMOUNT: Rs. ")
                .append(order.getTotalAmount()).append("\n\n");

        body.append("==================================================\n");

        body.append("WHAT'S NEXT?\n");
        body.append("Your order is now being processed. ")
                .append("We will keep you updated on its progress.\n\n");

        body.append("Thank you for shopping with ShopKart.\n");
        body.append("We truly appreciate your trust in us!\n\n");

        body.append("Happy Shopping!\n\n");

        body.append("Warm Regards,\n");
        body.append("ShopKart Customer Support Team\n");
        body.append("Your Shopping, Our Priority!\n");

        body.append("==================================================\n");
        body.append("This is an automatically generated email. ")
                .append("Please do not reply to this message.");

        message.setText(body.toString());

        mailSender.send(message);
    }
}
