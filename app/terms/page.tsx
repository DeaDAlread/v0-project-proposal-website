export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-6">Terms of Service & Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using "Who Am I?" (the "Service"), you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to these terms, please do not use this Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">2. Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            This Service is provided for entertainment purposes only. You agree to use this Service in compliance with 
            all applicable laws and regulations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities 
            that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">3. User-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You are solely responsible for any content you create, share, or transmit through the Service, including 
            custom decks, chat messages, and game interactions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to use the Service to create, share, or transmit any content that is offensive, illegal, 
            harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
          </p>
        </section>

        <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">4. Disclaimer of Liability</h2>
          <p className="text-muted-foreground leading-relaxed mb-3 font-semibold">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We do not take responsibility for any information, data, or content leaked, shared, or transmitted through 
            the Service. Users are solely responsible for protecting their own sensitive or critical information.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong>IMPORTANT:</strong> Do not share personal information, passwords, financial data, confidential business 
            information, or any other sensitive data through this Service.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of or inability to use the Service, including but not limited to data breaches, 
            information leaks, or unauthorized access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">5. Data Collection & Privacy</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We collect and store the following information:
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 mb-3">
            <li>Email address and display name</li>
            <li>Game activity (scores, lobbies joined, custom decks created)</li>
            <li>Chat messages sent during gameplay</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Your data is stored securely using Supabase and is only used to provide the Service functionality. 
            We do not sell or share your personal information with third parties.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You may request deletion of your account and associated data by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">6. Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            While we implement reasonable security measures to protect your data, no method of transmission over the 
            Internet is 100% secure. You use the Service at your own risk.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>You acknowledge and agree that:</strong> We are not responsible for any unauthorized access, data breaches, 
            or information leaks that may occur despite our security measures.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">7. Prohibited Activities</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4">
            <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Transmit viruses, malware, or other malicious code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Create spam or unsolicited content</li>
            <li>Share inappropriate, offensive, or harmful content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, 
            without notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">9. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the Service after changes 
            constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">10. Age Requirements</h2>
          <p className="text-muted-foreground leading-relaxed">
            You must be at least 13 years old to use this Service. Users under 18 should have parental consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">11. Contact</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you have any questions, concerns, or feedback about these Terms of Service, Privacy Policy, or the Service itself, please contact the developer:
          </p>
          <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-muted-foreground">
              <strong>Developer Contact:</strong>
            </p>
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              <a href="mailto:jakkritf88@gmail.com" className="hover:underline">
                jakkritf88@gmail.com
              </a>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-3">
            For account deletion requests, data privacy inquiries, or technical support, please email the address above.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            By using "Who Am I?", you acknowledge that you have read, understood, and agree to these Terms of Service 
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
