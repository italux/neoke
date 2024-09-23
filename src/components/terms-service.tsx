"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermsOfService() {
    const accordionItems = [
        {
          value: "item-1",
          title: "1. Acceptance of Terms",
          content:
            "By accessing and using our service, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.",
        },
        {
          value: "item-2",
          title: "2. Use of the Service",
          content:
            "You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for ensuring that your use of the service does not violate any applicable laws or regulations.",
        },
        {
          value: "item-3",
          title: "3. User Accounts",
          content:
            "If you create an account to use our service, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        },
        {
          value: "item-4",
          title: "4. Termination of Access",
          content:
            "We reserve the right to suspend or terminate your access to the service at any time, for any reason, including if we believe you have violated these Terms of Service.",
        },
        {
          value: "item-5",
          title: "5. Intellectual Property",
          content:
            "All content, trademarks, and data on the website, including but not limited to text, images, logos, and software, are the property of the service or its licensors. You may not copy, distribute, or use any of the material without prior written permission.",
        },
        {
          value: "item-6",
          title: "6. Limitation of Liability",
          content:
            "We are not liable for any damages that may occur as a result of using our service. This includes, but is not limited to, any loss of data, revenue, or profits, or any indirect, incidental, or consequential damages.",
        },
        {
          value: "item-7",
          title: "7. Changes to the Terms",
          content:
            'We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms of Service on this page and updating the "Effective Date." Your continued use of the service after such changes will signify your acceptance of the new terms.',
        },
        {
          value: "item-8",
          title: "8. Governing Law",
          content:
            "These Terms of Service are governed by the laws of Brazil. Any legal action related to your use of the service must be brought in the courts located in Brazil.",
        },
        {
          value: "item-9",
          title: "9. Contact Information",
          content:
            "If you have any questions or concerns about these Terms of Service, please contact us.",
        },
      ];

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Effective Date: September 21th, 2024</p>

          <Accordion
            type="multiple"
            defaultValue={accordionItems.map((item) => item.value)}
            className="w-full"
          >
            {accordionItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}