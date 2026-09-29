import React from 'react';
import { Title, Subtitle, Primary, Controls, Stories, Unstyled } from '@storybook/blocks';
import { ComponentGuidelines, componentSummary } from './ComponentDoc';
import { FigmaBadge } from './FigmaBadge';
import { components, figmaNodeUrl } from '../lib/components';
import '../lib/doc-ui.css';
import '../lib/component-doc.css';

/**
 * Docs page layout shared by every component, modelled on the Nord Health Storybook:
 * the live component with its code and controls, then each example story, then the
 * Figma-sourced guidelines (usage, design tokens, variant reference).
 *
 * Use in a stories file: `parameters: { docs: { page: componentDocsPage('button') } }`.
 */
export function componentDocsPage(componentKey: string, opts: { setIds?: string[] } = {}) {
  function DocsPage() {
    const snapshot = components[componentKey];
    const primarySet = opts.setIds?.[0] ?? snapshot?.sets[0]?.id;
    return (
      <>
        <div className="cd-docs-header">
          <Title />
          {primarySet && (
            <Unstyled>
              <FigmaBadge href={figmaNodeUrl(primarySet)} />
            </Unstyled>
          )}
        </div>
        <Subtitle>{componentSummary(componentKey, primarySet)}</Subtitle>
        <Primary />
        <Controls />
        <Stories title="Examples" includePrimary={false} />
        <Unstyled>
          <ComponentGuidelines componentKey={componentKey} setIds={opts.setIds} />
        </Unstyled>
      </>
    );
  }
  return DocsPage;
}
