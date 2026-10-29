const schemaData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "iyann99",
  "url": "https://switchlens.my.id",
  "sameAs": [
    "https://github.com",
    "https://github.com/SwitchLens"
  ]
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(schemaData);
document.head.appendChild(script);
