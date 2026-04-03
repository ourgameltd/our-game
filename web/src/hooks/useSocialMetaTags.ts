import { useEffect } from 'react';

function setMetaAttribute(selector: string, attr: 'content', value: string | undefined) {
  if (!value) {
    return;
  }

  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    const propertyMatch = selector.match(/property="([^"]+)"/);
    const nameMatch = selector.match(/name="([^"]+)"/);
    if (propertyMatch?.[1]) {
      element.setAttribute('property', propertyMatch[1]);
    } else if (nameMatch?.[1]) {
      element.setAttribute('name', nameMatch[1]);
    }
    document.head.appendChild(element);
  }

  element.setAttribute(attr, value);
}

export function useSocialMetaTags(input: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  useEffect(() => {
    if (input.title) {
      document.title = input.title;
    }

    setMetaAttribute('meta[property="og:title"]', 'content', input.title);
    setMetaAttribute('meta[property="og:description"]', 'content', input.description);
    setMetaAttribute('meta[property="og:image"]', 'content', input.image);
    setMetaAttribute('meta[property="og:url"]', 'content', input.url);
    setMetaAttribute('meta[property="og:type"]', 'content', 'website');
    setMetaAttribute('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaAttribute('meta[name="twitter:title"]', 'content', input.title);
    setMetaAttribute('meta[name="twitter:description"]', 'content', input.description);
    setMetaAttribute('meta[name="twitter:image"]', 'content', input.image);
  }, [input.description, input.image, input.title, input.url]);
}
