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
    const [faceError, setFaceError] = useState('');

    const validateFaceMutation = useMutation({
        mutationFn: () => isFaceValid(imgSrc),
        onSuccess: (data) => {
            setValidFace(data.verified);
            if (!data.verified) {
                let errorMessage = data.message;
                if (errorMessage.includes('No face detected in image')) {
                    errorMessage = 'No face detected in image. Please try again.';
                }
                setFaceError(errorMessage);
            }
        }
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
        setFaceError('');
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
            ),
            isNextDisabled: !attestation
        },
        {
            title: 'Face',
            description: 'Take a selfie to verify your identity.',
            component: () => (
                <div className="flex flex-col items-center gap-4">
                    {validFace ? (
                        <div className="text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2 pb-4">
                            <CheckCircle className="w-5 h-5" />
                            Face verification complete
                        </div>
                    ) : imgSrc ? (
                        <>
                            <Image src={imgSrc} alt="Captured selfie" width={1280} height={720} />
                            {validateFaceMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 dark:border-gray-100 border-t-transparent" />
                                    <div>Verifying face...</div>
                                </div>
                            ) : (
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => setImgSrc('')}>Retake photo</Button>
                                    <Button onClick={() => validateFaceMutation.mutate()} disabled={!!faceError}>Submit photo</Button>
                                </div>
                            )}
                            {faceError && (
                                <div className="text-red-600 dark:text-red-400 text-sm">
                                    {faceError}
                                </div>
                            )}
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
                            <div>
                                <Button onClick={capture}>Capture photo</Button>
                            </div>
                        </>
                    )}
                </div>
            ),
            isNextDisabled: !validFace || kycMutation.isPending
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