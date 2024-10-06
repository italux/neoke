"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivacyPolicy() {
  const accordionItems = [
    {
      value: "item-1",
      title: "1. Information We Collect",
      content:
        "When you use Google Authentication to access our services, we request access to the following information: Email address and Profile information (name, profile picture). This data is retrieved solely to authenticate your identity and provide you with access to our services. We do not store or retain any of this information.",
    },
    {
      value: "item-2",
      title: "2. How We Use Your Information",
      content:
        "The information collected during authentication is used strictly for the purpose of: Verifying your identity to provide access to the application. Personalizing your experience with your Google account details (e.g., displaying your name or profile picture). We do not store, share, or sell any personal data collected through Google Authentication.",
    },
    {
      value: "item-3",
      title: "3. Data Retention",
      content:
        "As stated above, we do not store any personal information. Once the authentication process is completed, the information is no longer retained by us.",
    },
    {
      value: "item-4",
      title: "4. Security",
      content:
        "Although we do not store any personal data, we implement industry-standard security measures to ensure that the authentication process is secure and that your data is handled with care. We rely on Google’s secure platform for authentication purposes.",
    },
    {
      value: "item-5",
      title: "5. Third-Party Services",
      content:
        "We use Google as a third-party service provider for authentication. By using our service, you are also agreeing to Google’s Privacy Policy at https://policies.google.com/privacy.",
    },
    {
      value: "item-6",
      title: "6. Your Consent",
      content:
        "By using our service and opting for Google Authentication, you consent to this Privacy Policy. If you do not agree with this policy, please do not use our service.",
    },
    {
      value: "item-7",
      title: "7. Changes to This Privacy Policy",
      content:
        'We may update this Privacy Policy from time to time to reflect changes in our practices. Any changes will be posted on this page with an updated "Effective Date."',
    },
    {
      value: "item-8",
      title: "8. Contact Us",
      content:
        "If you have any questions or concerns about this Privacy Policy, please contact us.",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
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
