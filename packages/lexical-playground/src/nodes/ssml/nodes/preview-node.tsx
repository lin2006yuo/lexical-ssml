/**
 * @fileOverview
 * @author linxueyu
 * @since 2023-03-26
 */

import React, { useState } from 'react'

export interface PreviewNodeProps {

}


export enum PreviewStatus {
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    LOADING = 'LOADING',
    IDLE = 'IDLE',
}

const PreviewNode: React.FC<PreviewNodeProps> = () => {
    const [status, setStatus] = useState<PreviewStatus>(PreviewStatus.IDLE)

    const handlePlay = () => {
        setStatus(PreviewStatus.LOADING)
    }

    const handleCancel = () => {
        setStatus(PreviewStatus.IDLE)
    }

    const handlePreviewClick = () => {
        if (status === PreviewStatus.IDLE) {
            handlePlay()
        }
        if (status === PreviewStatus.LOADING) {
            handleCancel()
        }
    }

    return (

        <div className='ssml-preview-node' onClick={handlePreviewClick}>
            {status === PreviewStatus.IDLE && <div className="ssml-preview-icon" />}
            {status === PreviewStatus.LOADING && <div>loading</div>}
        </div>


    );
}

export default PreviewNode;