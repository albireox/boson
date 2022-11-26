/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-25
 *  @Filename: PdfViewer.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { LoadingProcessData, TextLayerItemInternal } from 'react-pdf';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';

interface PdfViewerProps {
  file: string;
  scale: number;
  customTextRendered: (layer: TextLayerItemInternal) => JSX.Element;
  onLoadProgress: (data: LoadingProcessData) => void;
  width?: number;
}

export default function PdfViewer(props: PdfViewerProps) {
  const { file, scale, width, customTextRendered, onLoadProgress } = props;

  if (!file) return null;

  return (
    <Document
      file={file}
      renderMode='canvas'
      onLoadProgress={onLoadProgress}
      error=''
      loading=''
    >
      <Page
        pageNumber={1}
        scale={scale}
        width={width}
        customTextRenderer={customTextRendered}
        renderAnnotationLayer
        renderTextLayer
      />
    </Document>
  );
}
