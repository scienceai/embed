import assert from 'assert';
import embed from '../src';
import jsonld from 'jsonld';
import util from 'util';

describe('embed', function() {
  let framed, flattened;

  before(done => {
    const doc = {
      "@context": {
        "ex": "http://example.com",
        "sameAs":  {
          "@id": "http://schema.org/sameAs",
          "@container": "@list",
          "@type": "@id"
        },
        "author": {
          "@id": "http://schema.org/author",
          "@type": "@id"
        },
        "name": "http://schema.org/name",
        "givenName": "http://schema.org/givenName",
        "affiliation": "http://schema.org/affiliation",
        "member": {
          "@id": "http://schema.org/member",
          "@container": "@set",
          "@type": "@id"
        },
        "Organization": "http://schema.org/Organization",
        "Person": "http://schema.org/Person",
        "ScholarlyArticle": "http://schema.org/ScholarlyArticle",
        "Role": "http://schema.org/Role",
        "datePublished": "http://schema.org/datePublished"
      },
      "@id": "ex:article",
      "@type": "ScholarlyArticle",
      "sameAs": ["ex:a", "ex:b"],
      "author": {
        "@type": "Role",
        "author": {
          "@id": "ex:peter",
          "@type": "Person",
          "name": "Peter",
          "affiliation": {
            "@type": "Organization",
            "name": "Merck",
            "member": {
              "@id": "ex:peter",
              "@type": "Person",
              "name": "Peter",
              "givenName": "Peter"
            }
          }
        }
      }
    };
    jsonld.flatten(doc, {'@context': doc['@context']}, (err, _flattened) => {
      if (err) return done(err);
      flattened = _flattened;
      const frame = {
        '@context': doc['@context'],
        '@embed': '@always',
        '@type': 'ScholarlyArticle'
      };
      jsonld.frame(flattened, frame, { omitDefault: true }, (err, _framed) => {
        if (err) return done(err);
        framed = _framed;
        done();
      });
    });
  });

  it('should create a tree from a graph', () => {
    assert.deepEqual(
      embed('ex:article', flattened),
      framed['@graph'][0]
    );
  });

  it('should create a tree from a nodeMap', () => {
    const nodeMap = flattened['@graph'].reduce((nodeMap, node) => {
      nodeMap[node['@id']] = node;
      return nodeMap;
    }, {});

    assert.deepEqual(
      embed('ex:article', nodeMap),
      framed['@graph'][0]
    );
  });

});
