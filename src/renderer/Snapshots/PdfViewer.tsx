/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-25
 *  @Filename: PdfViewer.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';

// This seems to be necessary. Although VSCode/ESLint seem to be able to figure
// out that this is a native import from release/app/node_modules, webpack
// doesn't seem to be able to find the package and import undefined symbols.
// This also seems to work when building the package.

// eslint-disable-next-line import/no-relative-packages
import { Document, Page, pdfjs } from '../../node_modules/react-pdf';

interface PdfViewerProps {
  files: string[];
  index: number;
  scale: number;
  width?: number;
  searchText?: string;
}

export default function PdfViewer(props: PdfViewerProps) {
  const { files, index, scale, width, searchText } = props;

  const renderHighlight = React.useCallback(
    ({ str }: { str: string }) => {
      if (!searchText) return ReactDOMServer.renderToString(<span />);

      if (
        (searchText.length >= 4 && str.includes(searchText)) ||
        (searchText.length === 3 && str.includes(`P0${searchText}`)) ||
        (searchText.length === 2 && str.includes(`P00${searchText}`)) ||
        (searchText.length === 1 && str.includes(`P000${searchText}`))
      ) {
        const size: number = 30 * (scale ?? 1);
        const JSXElement = (
          <div
            style={{
              textAlign: 'center',
              color: '#fff',
              fontSize: '8em',
              height: `${size}px`,
              width: `${size}px`,
              position: 'relative',
              left: `-${size / 2}px`,
              top: `-${size / 2}px`,
            }}
          >
            <div
              style={{
                content: '',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'linear-gradient(crimson,#f90)',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 5px),#fff 0)',
              }}
            />
          </div>
        );
        return ReactDOMServer.renderToString(JSXElement);
      }

      return '<span />';
    },
    [searchText, scale],
  );

  React.useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  }, []);

  if (!files[index]) return null;

  return (
    <Document file={files[index]} renderMode='canvas' error='' loading=''>
      <Page
        pageNumber={1}
        scale={scale}
        width={width}
        customTextRenderer={renderHighlight}
        renderAnnotationLayer
        renderTextLayer
      />
    </Document>
  );
}
