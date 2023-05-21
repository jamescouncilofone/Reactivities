import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Grid, Header } from 'semantic-ui-react';
import PhotoWidgetDropzone from './PhotoWidgetDropzone';
import PhotoWidgetCropper from './PhotoWidgetCropper';
// import { Cropper } from 'react-cropper';

interface Props {
    loading: boolean;
    uploadPhoto: (file: Blob) => void;
}

export default function PhotoUploadWidget({loading, uploadPhoto}: Props) {
    const [files, setFiles] = useState<any>([]);    // <--- Empy array is to remove the warning about files possibly being undefined.
                                                    // <--- 'any' type is to remove the warning about property preview does not exist on type 'never'.
    
    const [cropper, setCropper] = useState<Cropper>();
    
    function onCrop() {
        if (cropper) {
            cropper.getCroppedCanvas().toBlob(blob => uploadPhoto(blob!));
        }
    }

    // Make sure the preview image is cleaned up from memory.
    useEffect(() => {
        return () => {
            files.forEach((file: any) => URL.revokeObjectURL(file.preview))
        }
    }, [files])

    return (
        <Grid>
            <Grid.Column width={4}>
                <Header sub color='teal' content='Step 1 - Add Photo' />
                <PhotoWidgetDropzone setFiles={setFiles} />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub color='teal' content='Step 2 - Resize Image' />
                {files && files.length > 0 && (
                    <PhotoWidgetCropper setCropper={setCropper} imagePreview={files[0].preview} />
                )}
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub color='teal' content='Step 1 - Preview & Upload' />

                {files && files.length > 0 && 
                    <>
                        <div className='img-preview' style={{minHeight: 200, overflow: 'hidden'}} />
                        <ButtonGroup widths={2}>
                            <Button loading={loading} onClick={onCrop} positive icon='check' />
                            <Button disabled={loading} onClick={() => setFiles([])} icon='close' />
                        </ButtonGroup>
                    </>
                }

            </Grid.Column>
        </Grid>
    )
}