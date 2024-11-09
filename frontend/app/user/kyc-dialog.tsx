import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { Button } from '@/components/ui/button';
import { OpenPassportVerifier } from '@openpassport/core';
import { OpenPassportQRcode } from '@openpassport/qrcode';
import { ReactNode, useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';

export function KYCDialog({ children, userId }: { children: ReactNode, userId: string }) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState('');

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) setImgSrc(imageSrc);
    }, [webcamRef]);

    const openPassportVerifier: OpenPassportVerifier = new OpenPassportVerifier('prove_offchain', 'thestartupcompany')
        .allowMockPassports();

    const steps: Step[] = [
        {
            title: 'Passport',
            description: 'Scan the QR code using the OpenPassport app. If you have not used OpenPassport before, download the app to verify your identity.',
            component: () => (
                <OpenPassportQRcode
                    appName="The Startup Company"
                    userId={userId}
                    userIdType={'uuid'}
                    openPassportVerifier={openPassportVerifier}
                    onSuccess={() => console.log('KYC verification successful')}
                    size={300}
                />
            )
        },
        {
            title: 'Face',
            description: 'Take a selfie to verify your identity.',
            component: () => (
                <>
                    {imgSrc ? (
                        <>
                            <Image src={imgSrc} alt="Captured selfie" width={1280} height={720} />
                            <Button onClick={() => setImgSrc('')}>Retake photo</Button>
                        </>
                    ) : (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                height={720}
                                width={1280}
                            />
                            <Button onClick={capture}>
                                Capture photo
                            </Button>
                        </>
                    )}
                </>
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