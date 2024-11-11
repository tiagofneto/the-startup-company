import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { Button } from '@/components/ui/button';
import { OpenPassportAttestation, OpenPassportVerifier } from '@openpassport/core';
import { OpenPassportQRcode } from '@openpassport/qrcode';
import { ReactNode, useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isFaceValid, verifyKyc } from '@/services/api';
import { CheckCircle } from 'lucide-react';

export function KYCDialog({ children, userId }: { children: ReactNode, userId: string }) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState('');
    const [attestation, setAttestation] = useState<OpenPassportAttestation | null>(null);
    const [validFace, setValidFace] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

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
                <div>
                    {attestation ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2 pb-4">
                                <CheckCircle className="w-5 h-5" />
                                Passport verification complete
                            </div>
                        </div>
                    ) : (
                        <OpenPassportQRcode
                            appName="The Startup Company"
                            userId={userId}
                            userIdType={'uuid'}
                            openPassportVerifier={openPassportVerifier}
                            onSuccess={(attestation) => {
                                setAttestation(attestation);
                                setCurrentStep(2);
                            }}
                            size={300}
                        />
                    )}
                </div>
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
            currentStep={currentStep}
            onStepChange={setCurrentStep}
        >
            {children}
        </BaseStepDialog>
    )
}