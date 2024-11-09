import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { Button } from '@/components/ui/button';
import { OpenPassportAttestation, OpenPassportVerifier } from '@openpassport/core';
import { OpenPassportQRcode } from '@openpassport/qrcode';
import { ReactNode, useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isFaceValid, verifyKyc } from '@/services/api';

export function KYCDialog({ children, userId }: { children: ReactNode, userId: string }) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState('');
    const [attestation, setAttestation] = useState<OpenPassportAttestation | null>(null);
    const [validFace, setValidFace] = useState(false);

    const validateFaceMutation = useMutation({
        mutationFn: () => isFaceValid(imgSrc),
        onSuccess: () => setValidFace(true)
    });

    const queryClient = useQueryClient();

    const kycMutation = useMutation({
        mutationFn: () => verifyKyc(attestation!, imgSrc),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });


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
                    onSuccess={(attestation) => setAttestation(attestation)}
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
                            <Button onClick={() => validateFaceMutation.mutate()}>Submit photo</Button>
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
            onComplete={() => kycMutation.mutate()}
            contentHeight="400px"
        >
            {children}
        </BaseStepDialog>
    )
}