import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { OpenPassportQRcode } from '@openpassport/sdk';
import { ReactNode } from 'react';

export function KYCDialog({ children, userId }: { children: ReactNode, userId: string }) {
    const steps: Step[] = [
        {
            title: 'Passport',
            description: 'Scan the QR code using the OpenPassport app. If you have not used OpenPassport before, download the app to verify your identity.',
            component: () => (
                <OpenPassportQRcode
                    appName="The Startup Company"
                    scope="@thestartupcompany"
                    userId={userId}
                    requirements={[]}
                    onSuccess={() => console.log('KYC verification successful')}
                    devMode={true}
                    size={300}
                />
            )
        }
    ]
    return (
        <BaseStepDialog
            title="KYC Verification"
            steps={steps}
            onComplete={() => console.log('KYC complete')}
            contentHeight="400px"
        >
            {children}
        </BaseStepDialog>
    )
}